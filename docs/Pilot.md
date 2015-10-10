## Tifast Pilot
Essa ferramente permite você controlar todas características importantes do Apple TestFlight usando o seu terminal.

* [tifast pilot upload](#upload)

* [tifast pilot builds](#builds)

* [tifast pilot add](#add)

* [tifast pilot export](#export)

* [tifast pilot import](#import)

* [tifast pilot find](#find)

* [tifast pilot list](#list)

* [tifast pilot remove](#remove)



`pilot` usa [spaceship.airforce](https://spaceship.airforce/) para interagir com o iTunes Connect.

### Upload

Isso vai procurar automaticamente o arquivo `ipa` dentro do diretório `dist` e vai usar as suas credências contidas no `tifastlane.cfg`.

    tifast pilot upload


Você também pode enviar seu binário `ipa`, sem distribuir para os seus "Testers".

    tifast pilot upload -s


### Builds
Para listar todas versões do app.

    tifast pilot builds


### Add
Adiciona um novo "external tester". Esse comando também vai adicionar um "tester" existente ao seu app.

    tifast pilot add


### Export
Exporta todos os "external testers" para um arquivo CSV.

    tifast pilot export


### Import
Importa "external testers" de um arquivo CSV. O arquivo **deve** estar em `appRoot/TiFLPilot/tester_import.csv`

    tifast pilot import


#### Importar Tester CSV
Aqui está um exemplo de como o `tester_import.csv` deve ser:

```javascript
// Nome, Sobrenome, Email
John,Appleseed,appleseed_john@mac.com
```


### Find
Acha um "tester" (interno ou externo) pelo seu email.

    tifast pilot find <tester@email.com>


### List
Lista todos "testers" registrados, interno e externo.

    tifast pilot list


### Remove
Remove um "tester" externo pelo email.

    tifast pilot remove <tester@email.com>
