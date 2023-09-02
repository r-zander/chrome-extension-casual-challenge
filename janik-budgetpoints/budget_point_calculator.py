import json

printingsFilePath = '.\\AllPrintings.json'
pricesFilePath = '.\\AllPrices.json'
# Contains a mapping of cardName => [ignoredSets] to basically blacklist certain prices that are just way off.
# For examples, check the file. For comments on each card+set combination check the commit history
ignoredPricesFilePath = '.\\IgnoredPrices.json'
outputPath = '..\\data\\card-prices.json'

earliestDate = 20230501  # inclusive
latestDate = 20230902  # exclusive

illegalBorderColors = ['silver', 'gold']

# cardPrices =
#	{'Soul Warden': {
#		'cheapestPerDayAverage': 1.11,
#		'cheapestPrintAverage': 1.21},
#	...}
cardPrices = {}


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


def calculatePricesForCard(cardName, uuidAttributes, isDebug=False):
	# if isDebug: print('calculatePricesForCard ' + cardName)
	# if isDebug: print('UUIDs and Attributes: ' + str(uuidAttributes))
	rawCardPrices = {}
	calculatedAveragePrices = {}
	for printingPriceUUID, attributes in uuidAttributes.items():
		if printingPriceUUID not in rawPrices:
			continue
		priceEntry = rawPrices[printingPriceUUID]
		if 'paper' not in priceEntry:
			continue
		paperPrice = priceEntry['paper']
		if 'cardmarket' not in paperPrice:
			continue
		cardmarketPrice = paperPrice['cardmarket']
		if 'retail' not in cardmarketPrice:
			continue
		cardmarketRetailPrice = cardmarketPrice['retail']
		if attributes['hasNonFoil'] == True and 'normal' in cardmarketRetailPrice:
			rawCardPrices[printingPriceUUID] = getPricesWhithinTimeRange(cardmarketRetailPrice['normal'])
		if attributes['hasFoil'] == True and 'foil' in cardmarketRetailPrice:
			rawCardPrices[printingPriceUUID + '-foil'] = getPricesWhithinTimeRange(cardmarketRetailPrice['foil'])
	# if isDebug: print('rawCardPrices:' + str(rawCardPrices))
	checkForAnomalies(rawCardPrices, cardName, uuidAttributes, isDebug)
	calculatedAveragePrices['A'] = round(getCheapestPrintAverage(rawCardPrices), 2)
	calculatedAveragePrices['B'] = round(getCheapestPerDayAverage(rawCardPrices), 2)
	cardPrices[cardName] = calculatedAveragePrices
	# if isDebug: print('calculatedAveragePrices: ' + str(calculatedAveragePrices))


def getDecklistPrice(decklist, mode='A', isDebug=False):
	totalDeckPrice = 0
	for cardName in decklist:
		if cardName not in cardPrices:
			calculatePricesForCard(cardName, decklist[cardName], isDebug)
			if len(cardPrices) % 100 == 0:
				print(str(len(cardPrices)) + ' cards done.')
		totalDeckPrice += cardPrices[cardName][mode]
	print(str(len(cardPrices)) + ' cards done.')
	return totalDeckPrice


# FetchAllPrintings that should be considered for price evaluation
# {
#	"Soul Warden": [UUID1, UUID2, ...],
#	..
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
				allCardVersion[cardName] = {}
			allCardVersion[cardName][card['uuid']] = {
				'setCode': card['setCode'],
				'hasFoil': card['hasFoil'],
				'hasNonFoil': card['hasNonFoil']
			}
	# if (len(allCardVersion) >= 5000):
	# 	break
	return allCardVersion


print('Untap, Upkeep, Draw!')

print('Reading printings')
with open(printingsFilePath, 'r', encoding='utf-8') as f:
	rawPrintings = json.load(f)['data']

print('Reading Prices')
with open(pricesFilePath, 'r', encoding='utf-8') as f:
	rawPrices = json.load(f)['data']

print('Reading Ignore list')
with open(ignoredPricesFilePath, 'r', encoding='utf-8') as f:
	rawIgnores = json.load(f)

print('Building up Card Dictionary')
# Add basics as free cards
basics = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes']
basicPrices = {'A': 0, 'B': 0}
for basic in basics:
	cardPrices[basic] = basicPrices

# Create a "decklist" with every card in existance
allCards = getAllCardVersions()
print('Done building Card Dictionary: ' + str(len(allCards)))

# Uncomment to look at a single card in detail
# allCards = {
# 	"Doomsday": allCards["Doomsday"]
# }
# getDecklistPrice(allCards, 'A', True)

print('Calculating budget points')
getDecklistPrice(allCards) # , 'A', True)

print('Writing card-prices.json')
with open(outputPath, 'w', encoding='utf-8') as f:
	f.write(json.dumps(cardPrices))

print('All done. Ending now.')
