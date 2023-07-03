import json

printingsFilePath = '.\\AllPrintings.json'
pricesFilePath = '.\\AllPrices.json'
# Contains a mapping of cardName => [ignoredSets] to basically blacklist certain prices that are just way off.
# For examples, check the file. For comments on each card+set combination check the commit history
ignoredPricesFilePath = '.\\IgnoredPrices.json'
testDecksPath = ['C:\\Users\\nisse\\Desktop\\SwampAss.txt','C:\\Users\\nisse\\Desktop\\RakSac.txt','C:\\Users\\nisse\\Desktop\\GelectrodeFun.txt']
outputPath = '..\\data\\card-prices.json'

earliestDate = 20230401 #inclusive
latestDate   = 20230701 #exclusive

illegalBorderColors = ['silver', 'gold']

#cardPrices = 
#	{'Soul Warden': {
#		'cheapestPerDayAverage': 1.11,
#		'cheapestPrintAverage': 1.21},
#	...}
cardPrices = {}


#This is only needed to read from a txt file. You can skip this function, if you already have an array of the decklist ready.
def readDecklistFromFile (filePath):
	with open(filePath, 'r', encoding='utf-8') as decklistFile:
		decklist = decklistFile.read().split('\n')
		return decklist


def getPricesWhithinTimeRange (pricesPerDay):
	pricesWithinTimeRange = {}
	for price in pricesPerDay:
		dateNumber = 0
		x = price.split('-')
		# TODO suspicious
		dateNumber = int(x[0]) * 10000 + int(x[1]) * 100 + int(x[2]) # Converting a date string 2022-02-01 into the number 20220201 for comparisons
		if (dateNumber >= earliestDate and dateNumber < latestDate):
			pricesWithinTimeRange[dateNumber]=(pricesPerDay[price])
	return pricesWithinTimeRange


def getCheapestPrintAverage (pricesPerPrintings):
	allAverages = []
	for printing in pricesPerPrintings:
		if (len(pricesPerPrintings[printing]) == 0):
			continue;
		sum = 0
		for date in pricesPerPrintings[printing]:
			sum += pricesPerPrintings[printing][date]
		allAverages.append(sum/len(pricesPerPrintings[printing]))
	if len(allAverages) == 0:
		return 0
	cheapestAverage = allAverages[0]
	for average in allAverages:
		if (cheapestAverage > average):
			cheapestAverage = average
	return cheapestAverage


def getCheapestPerDayAverage(pricesPerPrintings):
	allMinimumDayPrices = []
	allDates = []
	for printing in pricesPerPrintings:
		if (len(pricesPerPrintings[printing]) == 0):
			continue;
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
	return sum/len(allMinimumDayPrices)


def calculatePricesForCard (cardName, UUIDs, isDebug = False):
	rawCardPrices = {}
	calculatedAveragePrices = {}
	for printingPrice in UUIDs:
		if printingPrice not in rawPrices:
			print('No prices found for UUID ' + printingPrice)
			continue

		priceEntry = rawPrices[printingPrice]
		if 'paper' not in priceEntry:
			continue
		paperPrice = priceEntry['paper']
		if 'cardmarket' not in paperPrice:
			continue
		cardmarketPrice = paperPrice['cardmarket']
		if 'retail' not in cardmarketPrice:
			continue
		cardmarketRetailPrice = cardmarketPrice['retail']
		if 'normal' in cardmarketRetailPrice:
			rawCardPrices[printingPrice] = getPricesWhithinTimeRange(cardmarketRetailPrice['normal'])
		if 'foil' in cardmarketRetailPrice:
			rawCardPrices[printingPrice+'-foil'] = getPricesWhithinTimeRange(cardmarketRetailPrice['foil'])
	calculatedAveragePrices['A'] = round(getCheapestPrintAverage(rawCardPrices),2)
	calculatedAveragePrices['B'] = round(getCheapestPerDayAverage(rawCardPrices),2)
	cardPrices[cardName] = calculatedAveragePrices
	if isDebug:
		print (cardName+':'+str(calculatedAveragePrices))

def getDecklistPrice(decklist, mode = 'A', isDebug = False):
	totalDeckPrice = 0
	for cardName in decklist:
		if cardName not in cardPrices:
			calculatePricesForCard(cardName, decklist[cardName], isDebug)
			if (len(cardPrices) % 100 == 0):
				print (str(len(cardPrices)) + ' cards done.')
		totalDeckPrice += cardPrices[cardName][mode]
	print (str(len(cardPrices)) + ' cards done.')
	return (totalDeckPrice)

def printBothPricesForDecklist (decklistPath):
	deckFileName = decklistPath.split('\\')[-1]
	decklist = readDecklistFromFile(decklistPath)
	cheapestPrintingPrice = getDecklistPrice(decklist)
	cheapestDayPrice = getDecklistPrice(decklist, 'B')
	print(deckFileName + ': ' + str(cheapestPrintingPrice)+' | ' +str(cheapestDayPrice) )

# FetchAllPrintings that should be considered for price evaluation
# {
#	"Soul Warden": [UUID1, UUID2, ...],
#	..
# }
def getAllCardVersions(getIllegalPrintings = False, isDebug = False):
	allCardVersion = {}
	for mtgSet in rawPrintings:
		for card in rawPrintings[mtgSet]['cards']:
			cardName = card['name']

			if isDebug: print('Found in set: '+ mtgSet + ' with UUID ' + card['uuid'])
			if 'paper' not in card['availability']: # Is this as digital only card?
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
				allCardVersion[cardName] = []
			allCardVersion[cardName].append(card['uuid'])
	# if (len(allCardVersion) >= 5000):
	# 	break
	return allCardVersion

print ('Untap, Upkeep, Draw!')

print('Reading printings')
with open(printingsFilePath, 'r', encoding='utf-8') as f:
	rawPrintings = json.load(f)['data']

print('Reading Prices')
with open (pricesFilePath, 'r', encoding='utf-8') as f:
	rawPrices = json.load(f)['data']

print('Reading Ignore list')
with open (ignoredPricesFilePath, 'r', encoding='utf-8') as f:
	rawIgnores = json.load(f)

print('Building up Card Dictionary')
# Add basics as free cards
basics = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes']
basicPrices = {}
basicPrices['A'] = 0
basicPrices['B'] = 0
for basic in basics:
	cardPrices[basic]=basicPrices

# Create a "decklist" with every card in existance
allCards = getAllCardVersions()
print ('Done building Card Dictionary: ' + str(len(allCards)))

print ('Calculating budget points')
getDecklistPrice(allCards)

# print (getAllLegalPrintings("Tundra", False, True))


# printBothPricesForDecklist(testDecksPath[0])
# printBothPricesForDecklist(testDecksPath[1])
# printBothPricesForDecklist(testDecksPath[2])

print ('Writing card-prices.json')
with open(outputPath, 'w', encoding='utf-8') as f:
	f.write(json.dumps(cardPrices))

print ('All done. Ending now.')
