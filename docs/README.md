## Instalação

Pré-Requesitos:

* Mac OS 10.9 ou mais novo
* Ruby 2.0 ou mais novo (`ruby -v`)
* Xcode

Adicionalmente, você precisa da ferramenta de comando do Xcode.

    xcode-select --install


### Tifastlane

**ANTES** de baixar o `tifastlane` você **PRECISA** fazer esse truquezinho para baixar todas as ferramentas `gems`.

Edite o seu arquivo `.bashrc` ou `.zshrc`:

    export GEM_HOME=~/.gems
    export PATH="/Users/{Seu-Usuario}/.gems/bin"

* Salve
* Feche o terminal e abre ele de novo
* `mkdir  $GEM_HOME`

Tudo pronot! Não será mais necessário usar `sudo`( no lado das "gems" ).

    [sudo] npm install -g tifastlane

Agora você está pronto para começar :D

Caso alguma ferramenta apresente problemas na hora de instalar, consulte o [guia oficial do Nokogiri](http://www.nokogiri.org/tutorials/installing_nokogiri.html).

## Começando

Dentro do diretório do app, execute o comando para configurar o TiFastlane:

	tifast setup

Quando você tiver terminado a configuração, você inicializa:

	tifast init

E depois, quando você tiver terminado o seu app, você executa o comando para enviar para App Store:

	tifast send

**É simples assim!**

Abaixo você vai encontrar a documentação completa de cada passo e outras ferramentas disponíveis para você.

## Utilização

`tifastlane` ou `tifast` precisa ser executado no diretorio Root do seu App. Automaticamente, seu tiapp.xml vai ser lido para determinar as configurações do app.

#### Comandos disponíveis
* [tifast setup](#tifast-setup)
* [tifast init](#tifast-init)
* [tifast status](#tifast-status)
* [tifast register](#tifast-register)
* [tifast send](#tifast-send)
* [tifast pem](#tifast-pem)
* [tifast pilot](#tifast-pilot)
* [tifast snapshot](#tifast-snapshot)

#### Ajuda CLI

Cada comando tem seus próprio argumentos, opcionais. Você pode olhar a descrição e os opcionais de cada comando escrevendo -h, por exemplo:

    tifast setup -h

### Tifast Setup
Esse comando vai configurar o TiFastlane para o seu projeto.

    tifast setup

### Tifast Init

TiFastlane precisa ser inicializado para criar os arquivos e sincronizar com o iTunes Connect. Se o seu app **não está no iTunes Connect**, então você deve executar:

    tifast init

Se o seu app **já está no iTunes Connect**, então você deve rodar o comando a baixo para sincronizar seus dados com o app no iTunes Connect, baixando as informações e imagens:

    tifast init -s

### Tifast Status
Você pode ver as configurações atuais executando:

    tifast status

Você vai ver algo parecido com isso:

```javascript
Apple ID: contact@universopositivo.com.br
Name: Easy Ticket
AppId: br.com.universopositivo.easyTicket
Version: 1.0.0
CFBundleVersion: 107
GUID: "32cc538e-4fd3-4d6e-9999-870ce50ab039"
```

### Tifast Register
Registra o seu App na Apple Developer Program e iTunes Connect e depois, gera as "provisuinings" para App Store, Ad Hoc e Development.

    tifast register

Tudo é feito, por trás dos panos, pelo [produce](https://github.com/fastlane/produce) e [sigh](https://github.com/KrauseFx/sigh). Se seu App ID já existir no Developer Program ou iTunes Connect, o registro vai ser pulado.

Por padão, será gerado as "provisionings" para todas as plataformas(App Store, Ad Hoc e Development), mas se você quiser registrar apenas para uma plataforma, execute o comando de registrar mais a plataforma desejada. `appstore`, `adhoc` ou `development`.

    tifast register <platform>

### Tifast Send

Quando você quiser enviar uma nova versão do seu app para o iTunes Connect.

	tifast send


Se você quiser enviar **apenas as informações e imagens**, sem enviar o binário.

    tifast send -m

Se você quiser enviar uma **versão de teste** do seu app.

    tifast send -t


### Tifast PEM

Gera ou renova seus certificados de Push Notification.

	tifast pem [password]

Por padrão, o certificado gerado será de o certificado de Produção com a senha que você definir, se você quiser gerar o certificado de desenvolvimento, use esse comando:

	tifast pem -d [password]

Para renovar os certificados, mesmo que eles não tenham expirado ainda.

    tifast pem -f [password]


### Tifast Pilot
* [Documentação do Pilot](./Pilot.md)

### Tifast Snapshot
* [Documentação do Snapshot](./Snapshot.md)


## Arquivos de Configuração

Todas informações e imagens do app são mantidas no diretorio `TiFLDelivery\APPID`, aqui você vai encontrar os seguintes arquivos:

**Deliveryfile**

Você pode configurar preço, copyright, nota para desenvolvedor e etc. Você pode ler a [documentação completa  aqui](https://github.com/KrauseFx/deliver/blob/master/Deliverfile.md)

**./metadata/[LANG]/*.txt**

Nesse diretorio você verá vários arquivos de texto com as informações para o seu app, você pode customizar as informações com base na linguagem desejada.

#### Linguagens suportadas
`da`, `de-DE`, `el`, `en-AU`, `en-CA`, `en-GB`, `en-US`, `es-ES`, `es-MX`, `fi`, `fr-CA`, `fr-FR`, `id`, `it`, `ja`, `ko`, `ms`, `nl`, `no`, `pt-BR`, `pt-PT`, `ru`, `sv`, `th`, `tr`, `vi`, `zh-Hans`, `zh-Hant`

**./screenshots/[LANG]/*.***

Como as informações do app, as imagens também suportam varias linguagens. As imagens são organizadas por ordem alfabetica e as imagens se baseiam nas dimensões do dispositivo, então se certifique de nomealas corretamente.
