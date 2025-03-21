import datetime
import io
import json
import re
import zipfile
from datetime import date, datetime, timezone

import requests
import unicodedata

printingsFileName = 'AllPrintings.json'
printingsFilePath = '.\\' + printingsFileName


importFolder = '.\\season-16\\'
bansFile = 'bans.json'
extendedBansFile = 'extended-bans.json'
pricesFile = 'card-prices.json'



outputPath = '.\\output\\'

# seasonNumber => season info
seasons = {
	0: {
		"id": 0,
		"startDate": date(2021, 4, 1),
		"endDate": date(2021, 11, 30)
	},
	1: {
		"id": 1,
		"startDate": date(2021, 12, 1),
		"endDate": date(2022, 3, 31)
	},
	2: {
		"id": 2,
		"startDate": date(2022, 4, 1),
		"endDate": date(2022, 5, 31)
	},
	3: {
		"id": 3,
		"startDate": date(2022, 6, 1),
		"endDate": date(2022, 7, 31)
	},
	4: {
		"id": 4,
		"startDate": date(2022, 8, 1),
		"endDate": date(2022, 9, 30)
	},
	5: {
		"id": 5,
		"startDate": date(2022, 10, 1),
		"endDate": date(2022, 11, 30)
	},
	6: {
		"id": 6,
		"startDate": date(2022, 12, 1),
		"endDate": date(2023, 2, 28)
	},
	7: {
		"id": 7,
		"startDate": date(2023, 3, 1),
		"endDate": date(2023, 4, 30)
	},
	8: {
		"id": 8,
		"startDate": date(2023, 5, 1),
		"endDate": date(2023, 6, 30)
	},
	9: {
		"id": 9,
		"startDate": date(2023, 7, 1),
		"endDate": date(2023, 9, 1)
	},
	10: {
		"id": 10,
		"startDate": date(2023, 9, 2),
		"endDate": date(2023, 9, 10)
	},
	11: {
		"id": 11,
		"startDate": date(2023, 11, 11),
		"endDate": date(2024, 2, 2)
	},
	12: {
		"id": 12,
		"startDate": date(2024, 3, 2),
		"endDate": date(2024, 5, 10)
	},
	13: {
		"id": 13,
		"startDate": date(2024, 5, 28),
		"endDate": date(2024, 8, 10)
	},
	14: {
		"id": 14,
		"startDate": date(2024, 8, 11),
		"endDate": date(2024, 10, 11)
	},
	15: {
		"id": 15,
		"startDate": date(2024, 10, 12),
		"endDate": date(2024, 12, 27)
	},
	16: {
		"id": 16,
		"startDate": date(2025, 1, 13),
		"endDate": date(2025, 3, 14)
	}
}


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
				# if cardName in rawIgnores and mtgSet in rawIgnores[cardName]:
				# 	if isDebug: print('Card set is set to be ignored.')
				# 	continue

			if cardName not in allCardVersion:
				allCardVersion[cardName] = {
					'scryfallOracleId': card['identifiers']['scryfallOracleId'],
					'legalities': card['legalities'],
				}
				if "isFunny" in card:
					allCardVersion[cardName]['isFunny'] = card['isFunny']
					if card['isFunny'] == True and isDebug:
						print('Found funny card: ' + cardName)
				else:
					allCardVersion[cardName]['isFunny'] = False

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

def somewhatNormalizeCardName(cardName):
	# Replace diacritic characters
	normalized = unicodedata.normalize('NFD', cardName)
	normalized = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
	# Replace whitespace characters with "-"
	normalized = re.sub(r'\s', '-', normalized)
	# Replace multiple "-" with a single "-"
	normalized = re.sub(r'-+', '-', normalized)
	# Remove leading and trailing dashes
	normalized = normalized.strip('-')
	# Convert to lowercase
	normalized = normalized.lower()
	return normalized


def sql_escape_string(value: str) -> str:
	return "'" + value.replace("'", "''") + "'"


def sql_escape_uuid(uuid_str: str) -> str:
	# If you're sure it's always a valid UUID
	return f"'{uuid_str}'::uuid"


def createCardImportMigration(allCards):
	# Definition of the table we are trying to fill:
	#
	# 	CREATE TABLE IF NOT EXISTS public.card
	# (
	# 	id serial NOT NULL,
	# oracle_id uuid NOT NULL,
	# name character varying(1023) NOT NULL,
	# normalized_name character varying(1023) NOT NULL,
	# PRIMARY KEY (id)
	# );

	normalizedCardNames = {}
	oracleIds = {}
	chunk_size = 1000
	values_list = []

	added_at_str = f"'{datetime.now(timezone.utc).isoformat(timespec='seconds')}'"

	# now() just uses the system clock which is what we want when we create migration file names
	with open(outputPath + datetime.now().strftime("%Y%m%d_%H%M") + "_insert_cards.sql", "w", encoding="utf-8") as f:
		# Iterate over cards and insert them into the "card" table
		for i, (cardName, cardData) in enumerate(allCards.items()):
			oracleId = cardData['scryfallOracleId']
			# Fuck those cards...
			# They are "funny" cards those normalized names clash with actual cards
			# So they are not getting fully normalized. If someone tries to find them, better be very specific
			# (jokes on you, normalization on the API won't allow that)
			if cardName in [
				'Rampant, Growth',
				'Lava, Axe',
				'Gather, the Townsfolk',
				'Glimpse, the Unthinkable',
				'Ransack, the Lab',
				'Clear, the Mind'
			]:
				normalizedCardName = somewhatNormalizeCardName(cardName)
			else:
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

			values_list.append(f"\t({sql_escape_uuid(oracleId)}, {sql_escape_string(cardName)}, {sql_escape_string(normalizedCardName)}, {added_at_str})")
			# When we hit chunk_size or last row, write out the batch
			if (i > 0) and (i % chunk_size == 0):
				insert_statement = (
						"INSERT INTO public.card (oracle_id, \"name\", normalized_name, added_at)\n"
						"VALUES\n    " + ",\n".join(values_list) + ";\n"
				)
				f.write(insert_statement)
				values_list = []
				print(f'{i:05d} rows written.')
		# end for

		# If anything remains after the loop, write it
		if values_list:
			insert_statement = (
					"INSERT INTO public.card (oracle_id, \"name\", normalized_name, added_at)\n"
					"VALUES\n    " + ",\n".join(values_list) + ";\n"
			)
			f.write(insert_statement)

	return


def prepareBanList(fileName):
	with open(fileName, 'r', encoding='utf-8') as f:
		rawBans = json.load(f)
	banDict = {}
	for card in rawBans:
		banDict[card["name"]] = card["formats"]

	return banDict


def bannedFormats(legalities):
	bannedInFormats = []
	for frmt in ['standard', 'pioneer', 'modern', 'legacy', 'vintage', 'pauper']:
		if frmt in legalities and legalities[frmt] == 'Banned':
			bannedInFormats.append(frmt)
	return bannedInFormats


def determineLegality(cardName, legalities, budgetPoints, isCCBanned, isCCExtendedBanned, bannedInFormats):
	if cardName in [
		'Forest',
		'Mountain',
		'Island',
		'Plains',
		'Swamp',
		'Wasteland'
	]:
		return 'legal'

	# MTGJSON leaves out formats that are not legal
	if 'vintage' not in legalities:
		return 'not_legal'

	if budgetPoints is None or budgetPoints == 0:
		return 'not_legal'

	if 'vintage' in legalities and legalities['vintage'] == 'Restricted':
		return 'banned'

	if isCCBanned:
		return 'banned'

	if len(bannedInFormats) > 0:
		return 'banned'

	if isCCExtendedBanned:
		return 'extended'

	return 'legal'


def isCardFlipStyle(cardName):
	# Check if card name contains "//"
	if "//" in cardName:
		parts = cardName.split(" // ")
		# Ensure the part before and after "//" are the same
		if parts[0].strip() == parts[1].strip():
			return True
	return False


def createCardSeasonDataImportMigration(allCards):
	# Definition of the table we are trying to fill:
	#
	# CREATE TABLE IF NOT EXISTS public.card_season_data
	# (
	# 	id bigserial NOT NULL,
	# 	season_id integer NOT NULL,
	# 	card_oracle_id integer NOT NULL,
	# 	budget_points integer,
	# 	legality legality,
	# 	meta_share_standard numeric(4, 3),
	# 	meta_share_pioneer numeric(4, 3),
	# 	meta_share_modern numeric(4, 3),
	# 	meta_share_legacy numeric(4, 3),
	# 	meta_share_vintage numeric(4, 3),
	# 	meta_share_pauper numeric(4, 3),
	#   banned_in mtg_format,
	#   vintage_restricted boolean,
	#
	# 	PRIMARY KEY (id)
	# );

	seasonId = seasons[16]['id']

	print("Read card-prices.json")
	with open(importFolder + pricesFile, 'r', encoding='utf-8') as f:
		seasonCardPrices = json.load(f)

	bansByName = prepareBanList(importFolder + bansFile)
	extendedBansByName = prepareBanList(importFolder + extendedBansFile)

	chunk_size = 1000
	values_list = []

	# now() just uses the system clock which is what we want when we create migration file names
	with open(outputPath + datetime.now().strftime("%Y%m%d_%H%M") + "_insert_card_season_data.sql", "w", encoding="utf-8") as f:
		for i, (cardName, budgetPoints) in enumerate(seasonCardPrices.items()):
			if isCardFlipStyle(cardName):
				continue
			
			cardData = allCards[cardName]

			cardOracleId = cardData['scryfallOracleId']
			legalities = cardData['legalities']
			bannedInFormats = bannedFormats(legalities)
			isCCBanned = (cardName in bansByName)
			isCCExtendedBanned = (cardName in extendedBansByName)
			legality = determineLegality(
				cardName,
				legalities,
				budgetPoints,
				isCCBanned,
				isCCExtendedBanned,
				bannedInFormats
			)
			# TODO eh? have all formats?
			bannedIn = bannedInFormats[0] if len(bannedInFormats) > 0 else None
			if ('vintage' in legalities and legalities['vintage'] == 'restricted'):
				vintageRestricted = 'TRUE'
			else:
				vintageRestricted = 'FALSE'

			meta_share_standard = 'NULL'
			if isCCExtendedBanned and 'Standard' in extendedBansByName[cardName]:
				meta_share_standard = extendedBansByName[cardName]['Standard']
			elif isCCBanned and 'Standard' in bansByName[cardName]:
				meta_share_standard = bansByName[cardName]['Standard']

			meta_share_pioneer = 'NULL'
			if isCCExtendedBanned and 'Pioneer' in extendedBansByName[cardName]:
				meta_share_pioneer = extendedBansByName[cardName]['Pioneer']
			elif isCCBanned and 'Pioneer' in bansByName[cardName]:
				meta_share_pioneer = bansByName[cardName]['Pioneer']

			meta_share_modern = 'NULL'
			if isCCExtendedBanned and 'Modern' in extendedBansByName[cardName]:
				meta_share_modern = extendedBansByName[cardName]['Modern']
			elif isCCBanned and 'Modern' in bansByName[cardName]:
				meta_share_modern = bansByName[cardName]['Modern']

			meta_share_legacy = 'NULL'
			if isCCExtendedBanned and 'Legacy' in extendedBansByName[cardName]:
				meta_share_legacy = extendedBansByName[cardName]['Legacy']
			elif isCCBanned and 'Legacy' in bansByName[cardName]:
				meta_share_legacy = bansByName[cardName]['Legacy']

			meta_share_vintage = 'NULL'
			if isCCExtendedBanned and 'Vintage' in extendedBansByName[cardName]:
				meta_share_vintage = extendedBansByName[cardName]['Vintage']
			elif isCCBanned and 'Vintage' in bansByName[cardName]:
				meta_share_vintage = bansByName[cardName]['Vintage']

			meta_share_pauper = 'NULL'
			if isCCExtendedBanned and 'Pauper' in extendedBansByName[cardName]:
				meta_share_pauper = extendedBansByName[cardName]['Pauper']
			elif isCCBanned and 'Pauper' in bansByName[cardName]:
				meta_share_pauper = bansByName[cardName]['Pauper']


			dbLegality = f"'{legality}'::legality"
			if bannedIn is None:
				dbBannedIn = 'NULL'
			else:
				dbBannedIn = f"'{bannedIn}'::mtg_format"
			values_list.append(f"\t({seasonId}, {sql_escape_uuid(cardOracleId)}, {budgetPoints}, {dbLegality}, {meta_share_standard}, {meta_share_pioneer}, {meta_share_modern}, {meta_share_legacy}, {meta_share_vintage}, {meta_share_pauper}, {dbBannedIn}, {vintageRestricted})")
			# When we hit chunk_size or last row, write out the batch
			if (i > 0) and (i % chunk_size == 0):
				insert_statement = (
						"INSERT INTO public.card_season_data (season_id, card_oracle_id, budget_points, legality, meta_share_standard, meta_share_pioneer, meta_share_modern, meta_share_legacy, meta_share_vintage, meta_share_pauper, banned_in, vintage_restricted)\n"
						"VALUES\n    " + ",\n".join(values_list) + ";\n"
				)
				f.write(insert_statement)
				values_list = []
				print(f'{i:05d} rows written.')
		# end for

		# If anything remains after the loop, write it
		if values_list:
			insert_statement = (
					"INSERT INTO public.card_season_data (season_id, card_oracle_id, budget_points, legality, meta_share_standard, meta_share_pioneer, meta_share_modern, meta_share_legacy, meta_share_vintage, meta_share_pauper, banned_in, vintage_restricted)\n"
					"VALUES\n    " + ",\n".join(values_list) + ";\n"
			)
			f.write(insert_statement)

	return


totalSteps = 6
step = 0
digits = len(str(totalSteps))
print(f'{step:0{digits}d} / {totalSteps:d} | Untap, Upkeep, Draw!')
step += 1


print(f'{step:0{digits}d} / {totalSteps:d} | Reading printings')
step += 1
with open(printingsFilePath, 'r', encoding='utf-8') as f:
	rawPrintings = json.load(f)['data']


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

print(f'{step:0{digits}d} / {totalSteps:d} | Create import migration for table "card".')
step += 1
createCardImportMigration(allCards)

print(f'{step:0{digits}d} / {totalSteps:d} | Create import migration for table "card_season_data".')
step += 1
createCardSeasonDataImportMigration(allCards)

print(f'{step:0{digits}d} / {totalSteps:d} | All done. Ending now.')
