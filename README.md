# TiFastlane [![npm version](https://badge.fury.io/js/tifastlane.svg)](http://badge.fury.io/js/tifastlane)

Construir apps para iOS é ótimo, até você ter que lidar com Certificados, "Provisioning" e enviar para o iTunes Connect. Então veio [fastlane.tools](https://fastlane.tools/), uma coleção de ferramentas que possibilita um desenvolvimento contínuo de apps para iOS.

TiFastlane é uma forma de usar essas ferramentas para o [Appcelerator/Titanium](http://www.appcelerator.com/). Agora você vai ser capaz de fazer apps continuamente. Enviar seu app para "review" vai ser uma molesa:

	tifast send

Com TiFastlane você vai ser capaz de otimizar completamente o seu jeito de enviar as informações, fotos e certificados.


### Ferramentas [Fastlane](https://github.com/KrauseFx/fastlane) disponíveis:
<p align="center">

  &bull; <a href="https://github.com/KrauseFx/deliver">deliver</a> &bull;
  <a href="https://github.com/KrauseFx/snapshot">snapshot</a> &bull;
  <a href="https://github.com/KrauseFx/PEM">PEM</a> &bull;
  <a href="https://github.com/KrauseFx/sigh">sigh</a> &bull;
  <a href="https://github.com/KrauseFx/produce">produce</a> &bull;
  <a href="https://github.com/fastlane/pilot">pilot</a> &bull;
  <a href="https://github.com/fastlane/boarding">boarding</a>
</p>

## [Documentação](./docs/README.md)


## A Fazer

* Adicionar [Frameit](https://github.com/fastlane/frameit)
* Especificar o certificado padrão para usar.

##  Colaboradores

* [Uriel Lizama](https://github.com/ulizama)
* [Douglas Hennrich](https://github.com/DouglasHennrich)

##  Obrigado

* [Felix Krause](https://github.com/KrauseFx) por criar a incrível fastlane.tools
* [Jason Kneen](https://github.com/jasonkneen) por criar algumas CLI maravilhosas na qual eu estou me baseando

## Changelog
* 0.3.6 Atualização para usar as últimas ferramentas do fastlane do [@KrauseFx](https://github.com/KrauseFx/fastlane)
* 0.3.4 Consertado `status` e `snapshot`
* 0.3.3 Atualiza versão app quando envia

## Licença

<pre>
Copyright 2015 Uriel Lizama

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
</pre>
