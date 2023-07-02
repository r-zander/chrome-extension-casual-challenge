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


#FetchAllPrintings that should be considered for price evaluation
def getAllLegalPrintings(cardName, getIllegalPrintings = False, isDebug = False):
	if isDebug: print('Looking for '+ cardName)
	legalUUIDs = []
	for mtgSet in rawPrintings:
		for card in rawPrintings[mtgSet]['cards']:
			if(cardName != card['name']):
				continue

			if isDebug: print('Found in set: '+ mtgSet + ' with UUID ' + card['uuid'])
			if 'paper' not in card['availability']: # Is this as digital only card?
				if isDebug: print('Digital only card')
				continue
			if (not getIllegalPrintings):
				if ('isOversized' in card and card['isOversized'] == True):
					if isDebug: print('Oversized card')
					continue
				if (card['borderColor'] in illegalBorderColors):
					if isDebug: print('Illegal card border: ' + card['borderColor'])
					continue
				if (cardName in rawIgnores and mtgSet in rawIgnores[cardName]):
					if isDebug: print('Card set is set to be ignored.')
					continue

			legalUUIDs.append(card['uuid'])
	return legalUUIDs

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

def calculatePricesForCard (cardName, isDebug = False):
	uuids = getAllLegalPrintings(cardName, False, isDebug)
	rawCardPrices = {}
	calculatedAveragePrices = {}
	for printingPrice in rawPrices:
		for uuid in uuids:
			if(printingPrice == uuid):
				if 'cardmarket' not in rawPrices[printingPrice]['paper']:
					continue
				if 'retail' not in rawPrices[printingPrice]['paper']['cardmarket']:
					continue
				if 'normal' in rawPrices[printingPrice]['paper']['cardmarket']['retail']:
					rawCardPrices[uuid] = getPricesWhithinTimeRange(rawPrices[printingPrice]['paper']['cardmarket']['retail']['normal'])
				if 'foil' in rawPrices[printingPrice]['paper']['cardmarket']['retail']:
					rawCardPrices[uuid+'-foil'] = getPricesWhithinTimeRange(rawPrices[printingPrice]['paper']['cardmarket']['retail']['foil'])
	calculatedAveragePrices['A'] = round(getCheapestPrintAverage(rawCardPrices),2)
	calculatedAveragePrices['B'] = round(getCheapestPerDayAverage(rawCardPrices),2)
	cardPrices[cardName] = calculatedAveragePrices
	if isDebug:
		print (cardName+':'+str(calculatedAveragePrices))

def getDecklistPrice(decklist, mode = 'A', isDebug = False):
	totalDeckPrice = 0
	for card in decklist:
		if card not in cardPrices:
			calculatePricesForCard(card, isDebug)
		totalDeckPrice += cardPrices[card][mode]
	return (totalDeckPrice)

def printBothPricesForDecklist (decklistPath):
	deckFileName = decklistPath.split('\\')[-1]
	decklist = readDecklistFromFile(decklistPath)
	cheapestPrintingPrice = getDecklistPrice(decklist)
	cheapestDayPrice = getDecklistPrice(decklist, 'B')
	print(deckFileName + ': ' + str(cheapestPrintingPrice)+' | ' +str(cheapestDayPrice) )

print ('Untap, Upkeep, Draw!')

print('Reading printings')
with open(printingsFilePath, 'r', encoding='utf-8') as f:
	rawPrintings = json.load(f)['data']
print ('Done Reading Cards')

print('Reading Prices')
with open (pricesFilePath, 'r', encoding='utf-8') as f:
	rawPrices = json.load(f)['data']
print ('Done Reading Prices')

print('Reading Ignore list')
with open (ignoredPricesFilePath, 'r', encoding='utf-8') as f:
	rawIgnores = json.load(f)
print ('Done Reading Ignore list')

print('Building up Card Dictionary')
# Add basics as free cards
basics = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest', 'Wastes']
basicPrices = {}
basicPrices['A'] = 0
basicPrices['B'] = 0
for basic in basics:
	cardPrices[basic]=basicPrices

# Create a "decklist" with every card in existance
allCardNames = []
for mtgSet in rawPrintings:
	for card in rawPrintings[mtgSet]['cards']:
		if card['name'] not in allCardNames:
			allCardNames.append(card['name'])
print ('Done building Card Dictionary: ' + str(len(allCardNames)))

print ('Calculating budget points')
getDecklistPrice(allCardNames)
print ('Done calculating budget points')

# print (getAllLegalPrintings("Tundra", False, True))


# printBothPricesForDecklist(testDecksPath[0])
# printBothPricesForDecklist(testDecksPath[1])
# printBothPricesForDecklist(testDecksPath[2])

print ('Writing card-prices.json')
with open(outputPath, 'w', encoding='utf-8') as f:
	f.write(json.dumps(cardPrices))

print ('All done. Ending now.')
