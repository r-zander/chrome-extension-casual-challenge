import locale
import json

filePath = '..\\data\\card-prices.json'

with open (filePath, 'r', encoding='utf-8') as f:
    data = json.load(f)

locale.setlocale(locale.LC_NUMERIC, "de_DE.UTF-8")
# Header
# print('cardName' + '\t' + 'A' + '\t' + 'B')
print('cardName' + '\t' + 'B')
for cardName, values in data.items():
    # print(cardName + '\t' + locale.format_string('%.2f', values['A']) + '\t' + locale.format_string('%.2f', values['B']))
    if cardName.startswith('+'):
        cardName = "'" + cardName
    print(cardName + '\t' + locale.format_string('%d', values))
