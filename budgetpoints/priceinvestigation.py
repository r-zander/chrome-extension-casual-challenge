import json

cardNames = ["Baleful Strix", "Soul Warden", "Arahbo, Roar of the World", "Tundra", "Countainment Priest"]
bannedSets = ["SUM", "TD0", "MED", "ME2", "ME3", "ME4", "VMA", "TPR", "PZ1", "PZ2", "PRM"]
printingsFilePath = "../Data/AllPrintings.json"
pricesFilePath = "../Data/AllPrices.json"

#Read a json file
def readFile(file):
	with open(file, 'r', encoding='utf-8') as f:
		loadedfile = json.load(f)['data']
	return loadedfile

#Find all UUIDs of legal printings with that card name
def GetLegalVersionOfCard (name):
	uuids = [];
	#print(name)
	for set in printings:
		if set in bannedSets:
			continue
		for card in printings[set]['cards']:
			if (name == card['name'] and len(card['legalities'])>0):
				uuids.append(card['uuid'])
				print ("\t" + set + "-"+str(len(card['legalities'])))
	return uuids

#Programm start
print ("Untap")
print("Untapping Amoeboid Changeling...")

printings = readFile(printingsFilePath)

print("Untapping Treasure Vault...")
prices = readFile(pricesFilePath)

for card in cardNames:
	ids = GetLegalVersionOfCard(card)
	print(card)
	for cardId in ids:
		if (cardId not in prices):
			print("not a physical product!")
			continue
		if('normal' in prices[cardId]['paper']['cardmarket']['retail']):
			print(str(len (prices[cardId]['paper']['cardmarket']['retail']['normal'])) +" in " + cardId)
		else:
			print("none in "+ cardId)
			#for x in prices[cardId]['paper']['cardmarket']['retail']['normal']:
			#	print(x)
	print('==========')

#print(str(prices[GetLegalVersionOfCard(cardNames[0])[0]]['paper']['cardmarket']))