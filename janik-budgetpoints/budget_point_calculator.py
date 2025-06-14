import io
import json
import re
import zipfile

import psycopg2
import requests
import unicodedata
from psycopg2 import sql

printingsFileName = 'AllPrintings.json'
printingsFilePath = '.\\' + printingsFileName
pricesFileName = 'AllPrices.json'
pricesFilePath = '.\\' + pricesFileName
# Contains a mapping of cardName => [ignoredSets] to basically blacklist certain prices that are just way off.
# For examples, check the file. For comments on each card+set combination check the commit history
ignoredPricesFilePath = '.\\IgnoredPrices.json'
outputPath = '..\\data\\card-prices.json'

earliestDate = 20250329  # inclusive
latestDate = 20250607  # exclusive

illegalBorderColors = ['silver', 'gold']

# cardPrices =
# 	{'Soul Warden': {'EUR': 121, 'USD': 147},
# 	...}
cardPrices = {}
avgExchangeRate = 0

def download(url, fileName):
	# Step 1: Download the MTGJSON zip file
	response = requests.get(url)

	# Check if the request was successful
	if response.status_code == 200:
		# Step 2: Unpack the downloaded zip file
		with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
			try:
				zip_file.extract(fileName)
				print(f"{fileName} has been successfully unpacked.")
			except (ValueError, RuntimeError, KeyError) as err:
				print(f"Error extracting {fileName}.", err)
	else:
		print(f"Failed to download {url}. Status code: {response.status_code}\n{response.text}")


def getPricesWhithinTimeRange(pricesPerDay):
	pricesWithinTimeRange = {}
	for price in pricesPerDay:
		x = price.split('-')
		# TODO suspicious
		# Converting a date string 2022-02-01 into the number 20220201 for comparisons
		dateNumber = int(x[0]) * 10000 + int(x[1]) * 100 + int(x[2])
		if dateNumber >= earliestDate and dateNumber < latestDate:
			pricesWithinTimeRange[dateNumber] = (pricesPerDay[price])
	return pricesWithinTimeRange


def getCheapestPrintAverage(pricesPerPrintings):
	allAverages = []
	for printing in pricesPerPrintings:
		if len(pricesPerPrintings[printing]) == 0:
			continue
		sum = 0
		for date in pricesPerPrintings[printing]:
			sum += pricesPerPrintings[printing][date]
		allAverages.append(sum / len(pricesPerPrintings[printing]))
	if len(allAverages) == 0:
		return 0
	cheapestAverage = allAverages[0]
	for average in allAverages:
		if cheapestAverage > average:
			cheapestAverage = average
	return cheapestAverage


def getCheapestPerDayAverage(pricesPerPrintings):
	allMinimumDayPrices = []
	allDates = []
	for printing in pricesPerPrintings:
		if len(pricesPerPrintings[printing]) == 0:
			continue
		for date in pricesPerPrintings[printing]:
			if date not in allDates:
				allDates.append(date)
	if len(allDates) == 0:
		return 0
	for date in allDates:
		minimumPrice = -1
		for printing in pricesPerPrintings:
			if date in pricesPerPrintings[printing]:
				if minimumPrice < 0 or minimumPrice > pricesPerPrintings[printing][date]:
					minimumPrice = pricesPerPrintings[printing][date]
		allMinimumDayPrices.append(minimumPrice)
	sum = 0
	for average in allMinimumDayPrices:
		sum += average
	return sum / len(allMinimumDayPrices)


def checkForAnomalies(pricesPerPrintings, cardName, uuidAttributes, isDebug=False):
	uuidsToBeRemoved = []
	for uuid, prices in pricesPerPrintings.items():
		if len(prices) == 0:
			continue

		knownPrice = -1
		allPricesMatch = True
		for price in prices.values():
			if knownPrice == -1:
				knownPrice = price
			elif knownPrice != price:
				allPricesMatch = False
				break
		if allPricesMatch:
			# if isDebug:
			# 	if uuid.endswith('-foil'):
			# 		print('Price anomaly for ' + cardName + ' FOIL (' + str(
			# 			uuidAttributes[uuid.replace('-foil', '')]) + '): All prices are ' + str(knownPrice))
			# 	else:
			# 		print(
			# 			'Price anomaly for ' + cardName + ' (' + str(uuidAttributes[uuid]) + '): All prices are ' + str(
			# 				knownPrice))
			uuidsToBeRemoved.append(uuid)

	if len(pricesPerPrintings) > len(uuidsToBeRemoved):
		for uuid in uuidsToBeRemoved:
			pricesPerPrintings.pop(uuid)
	else:
		if isDebug: print('For ' + cardName + ' all prices had anomalies.')


def tryFindingRawPricesForCard(rawCardEurPrices, paperPrice, marketIdentifier, attributes, printingPriceUUID):
	if marketIdentifier not in paperPrice:
		return

	marketPrice = paperPrice[marketIdentifier]
	if 'retail' not in marketPrice:
		return

	marketRetailPrice = marketPrice['retail']
	if attributes['hasNonFoil'] == True and 'normal' in marketRetailPrice:
		rawCardEurPrices[printingPriceUUID] = getPricesWhithinTimeRange(marketRetailPrice['normal'])
	if attributes['hasFoil'] == True and 'foil' in marketRetailPrice:
		rawCardEurPrices[printingPriceUUID + '-foil'] = getPricesWhithinTimeRange(marketRetailPrice['foil'])


def finalizeCardPrice(cardName, isDebug, mode, rawCardEurPrices, uuidAttributes):
	# if isDebug: print('rawCardEurPrices:' + str(rawCardEurPrices))
	checkForAnomalies(rawCardEurPrices, cardName, uuidAttributes, isDebug)
	if mode == 'CheapestPrintAverage':
		price = getCheapestPrintAverage(rawCardEurPrices)
	elif mode == 'CheapestPerDayAverage':
		price = getCheapestPerDayAverage(rawCardEurPrices)
	else:
		raise ValueError('Unsupported mode ' + mode)
	return price


def calculatePricesForCard(cardName, uuidAttributes, mode='CheapestPerDayAverage', isDebug=False):
	# if isDebug: print('calculatePricesForCard ' + cardName)
	# if isDebug: print('UUIDs and Attributes: ' + str(uuidAttributes))
	rawCardEurPrices = {}
	rawCardUsdPrices = {}
	calculatedAveragePrices = {}
	for printingPriceUUID, attributes in uuidAttributes.items():
		if printingPriceUUID not in rawPrices:
			continue
		priceEntry = rawPrices[printingPriceUUID]
		if 'paper' not in priceEntry:
			continue
		tryFindingRawPricesForCard(rawCardEurPrices, priceEntry['paper'], 'cardmarket', attributes, printingPriceUUID)
		tryFindingRawPricesForCard(rawCardUsdPrices, priceEntry['paper'], 'tcgplayer', attributes, printingPriceUUID)

	eurPrice = finalizeCardPrice(cardName, isDebug, mode, rawCardEurPrices, uuidAttributes)
	usdPrice = finalizeCardPrice(cardName, isDebug, mode, rawCardUsdPrices, uuidAttributes)

	cardPrices[cardName] = {
		'EUR': round(eurPrice * 100),
		'USD': round(usdPrice * 100),
		'exR': usdPrice / eurPrice if eurPrice > 0 else None
	}


# if isDebug: print('calculatedAveragePrices: ' + str(cardPrices[cardName]))


def getDecklistPrice(decklist, mode='CheapestPerDayAverage', isDebug=False):
	global avgExchangeRate

	totalDeckPrice = 0
	totalExchangeRate = 0
	exchangeRateCount = 0
	for cardName in decklist:
		if cardName not in cardPrices:
			calculatePricesForCard(cardName, decklist[cardName], mode, isDebug)
			if len(cardPrices) % 500 == 0:
				print(f'{len(cardPrices):05d} cards done.')
			if cardPrices[cardName]['exR'] is not None:
				totalExchangeRate += cardPrices[cardName]['exR']
				exchangeRateCount += 1
		totalDeckPrice += cardPrices[cardName]['EUR']

	avgExchangeRate = totalExchangeRate / exchangeRateCount
	print(f'{len(cardPrices):05d} cards done.')
	return totalDeckPrice


# FetchAllPrintings that should be considered for price evaluation
# {
# 	"Soul Warden": [UUID1, UUID2, ...],
# 	..
# }
def getAllCardVersions(getIllegalPrintings=False, isDebug=False):
	allCardVersion = {}
	for mtgSet in rawPrintings:
		for card in rawPrintings[mtgSet]['cards']:
			cardName = card['name']

			if isDebug: print('Found in set: ' + mtgSet + ' with UUID ' + card['uuid'])
			if 'paper' not in card['availability']:  # Is this as digital only card?
				if isDebug: print('Digital only card')
				continue

			if not getIllegalPrintings:
				if 'isOversized' in card and card['isOversized'] == True:
					if isDebug: print('Oversized card')
					continue
				if card['borderColor'] in illegalBorderColors:
					if isDebug: print('Illegal card border: ' + card['borderColor'])
					continue
				if cardName in rawIgnores and mtgSet in rawIgnores[cardName]:
					if isDebug: print('Card set is set to be ignored.')
					continue

			if cardName not in allCardVersion:
				allCardVersion[cardName] = {
					'scryfallOracleId': card['identifiers']['scryfallOracleId']
				}
			allCardVersion[cardName][card['uuid']] = {
				'setCode': card['setCode'],
				'hasFoil': card['hasFoil'],
				'hasNonFoil': card['hasNonFoil']
			}
	# if (len(allCardVersion) >= 5000):
	# 	break
	return allCardVersion


# Card Name Normalization
# 1. Replace any diacritic character with its base version
# 2. Replace anything that is not a letter or number with - (dash)
# 3. Replace repeating instances of - (dash) with a single - (dash)
# 4. Lower case
def normalizeCardName(cardName):
	# Replace diacritic characters
	normalized = unicodedata.normalize('NFD', cardName)
	normalized = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
	# Replace non-alphanumeric characters with "-"
	normalized = re.sub(r'[^a-zA-Z0-9]', '-', normalized)
	# Replace multiple "-" with a single "-"
	normalized = re.sub(r'-+', '-', normalized)
	# Remove leading and trailing dashes
	normalized = normalized.strip('-')
	# Convert to lowercase
	normalized = normalized.lower()
	return normalized


def fill_database(allCards):
	try:
		# Connect to PostgreSQL database
		connection = psycopg2.connect(
			dbname="casual_challenge",
			user="postgres",
			password="abcABC1234",
			host="localhost",
			port="5432"
		)
		cursor = connection.cursor()

		normalizedCardNames = {}
		oracleIds = {}

		# Iterate over cards and insert them into the "card" table
		for cardName in allCards:
			oracleId = allCards[cardName]['scryfallOracleId']
			normalizedCardName = normalizeCardName(cardName)
			if normalizedCardName not in normalizedCardNames:
				normalizedCardNames[normalizedCardName] = [cardName]
			else:
				normalizedCardNames[normalizedCardName].append(cardName)
				print('Duplicate normalized name found for:', normalizedCardNames[normalizedCardName])
				continue

			if oracleId not in oracleIds:
				oracleIds[oracleId] = [cardName]
			else:
				oracleIds[oracleId].append(cardName)
				print('Duplicate oracle id found for:', oracleIds[oracleId])
				continue

			try:
				# Insert data into the database using a parameterized query
				cursor.execute(
					sql.SQL("INSERT INTO casual_challenge.public.card (oracle_id, name, normalized_name) VALUES (%s, %s, %s)")
					.format(),
					(oracleId, cardName, normalizedCardName)
				)
			except Exception as error:
				print("Error while inserting data into database:", error)

		# Commit all changes to the database
		connection.commit()
		print("Database successfully filled with cards.")

	except Exception as error:
		print("Other database error:", error)
		raise error

	finally:
		# Close the cursor and connection
		if cursor:
			cursor.close()
		if connection:
			connection.close()


def calculateMissingPrices(isDebug=False):
	fixedCards = []
	for cardName, priceDef in cardPrices.items():
		if priceDef['EUR'] > 0:
			continue

		if priceDef['USD'] == 0:
			continue

		priceDef['EUR'] = round(priceDef['USD'] / avgExchangeRate)
		fixedCards.append(cardName)

	print('Fixed ' + str(len(fixedCards)) + ' card prices.')
	if isDebug: print(fixedCards)


totalSteps = 11
step = 0
digits = len(str(totalSteps))
print(f'{step:0{digits}d} / {totalSteps:d} | Untap, Upkeep, Draw!')
step += 1

print(f'{step:0{digits}d} / {totalSteps:d} | Downloading AllPrintings.json')
step += 1
download('https://mtgjson.com/api/v5/AllPrintings.json.zip', printingsFileName)

print(f'{step:0{digits}d} / {totalSteps:d} | Downloading AllPrices.json')
step += 1
download('https://mtgjson.com/api/v5/AllPrices.json.zip', pricesFileName)

print(f'{step:0{digits}d} / {totalSteps:d} | Reading printings')
step += 1
with open(printingsFilePath, 'r', encoding='utf-8') as f:
	rawPrintings = json.load(f)['data']

print(f'{step:0{digits}d} / {totalSteps:d} | Reading Prices')
step += 1
with open(pricesFilePath, 'r', encoding='utf-8') as f:
	rawPrices = json.load(f)['data']

print(f'{step:0{digits}d} / {totalSteps:d} | Reading Ignore list')
step += 1
with open(ignoredPricesFilePath, 'r', encoding='utf-8') as f:
	rawIgnores = json.load(f)

print(f'{step:0{digits}d} / {totalSteps:d} | Building up Card Dictionary')
step += 1
# Add basics as free cards
basics = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes']
basicPrices = 0
for basic in basics:
	cardPrices[basic] = {
		'EUR': basicPrices,
		'USD': basicPrices,
	}

# Create a "decklist" with every card in existence
allCards = getAllCardVersions()
print('Done building Card Dictionary: ' + str(len(allCards)))


# print(f'{step:0{digits}d} / {totalSteps:d} | Fill cards into database.')
# step += 1
# fill_database(allCards)
# print('Done filling database.')

# Uncomment to look at a single card in detail
# allCards = {
# 	"Doomsday": allCards["Doomsday"]
# }
# getDecklistPrice(allCards, 'A', True)

print(f'{step:0{digits}d} / {totalSteps:d} | Calculating budget points - that\'s the big step!')
step += 1
getDecklistPrice(allCards)  # , 'A', True)
print('Average Exchange Rate is: ' + str(avgExchangeRate))
# To be defensive, the avgExchangeRate is reduced
avgExchangeRate = (1 + avgExchangeRate) / 2
print('Adjusted average Exchange Rate is: ' + str(avgExchangeRate))

print(f'{step:0{digits}d} / {totalSteps:d} | Use exchange rate to fix missing budget points')
step += 1
calculateMissingPrices()

print(f'{step:0{digits}d} / {totalSteps:d} | Writing card-prices.json')
step += 1
cardBudgetPoints = {key: value["EUR"] for key, value in cardPrices.items()}
with open(outputPath, 'w', encoding='utf-8') as f:
	f.write(json.dumps(cardBudgetPoints, indent='', separators=(',', ':'), sort_keys=True))

print(f'{step:0{digits}d} / {totalSteps:d} | All done. Ending now.')
