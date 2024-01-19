WELCOME TO THE ROBOTS!

Projektet fungerar genom att PUBLISHER är publiceraren som kan sätta maximala hastigheter till robotarna.
Om du startar Publisher.HTML och sedan öppnar av av robotarnas HTML fil så borde publiceraren känna av den.

Robot-300 är uppdelad i två webbläsare som kräver att båda är uppe för att den ska fungera korrekt.
Robot-569 har endast en.

TELEREMOTE fungerar liknande till PUBLISHER vilket innebär att den känner när en av de andra robotarna är uppe och igång.
Teleremote ska kunna välja en av robotarna och visa informationen om den valda roboten på webbläsaren.


-------------VIKTIGT-------------
Just nu går robotarna över en MQTT-broker över webben. Detta indikeras i varje javascript kod med funktionen:

 " const host = "ws://broker.emqx.io:8083/mqtt" "
 
Detta gör att filerna funkar att med brokern utan att behöva vara på Invencons kontor.
Om ni är uppkopplade till gäst nätverket och byter ut raden över med kodraden under så ska det gå igenom den fysiska brokern på Invencons kontor.

" //const host = "ws://10.0.20.114:9001/mqtt"; "

Om den fysiska brokern är avstängd behövs den sättas på och loggas in på.
Detta kan göras genom att antigen ssh in på brokern eller koppla upp den till en skärm.
Login och Lösen är detsamma : broker

-------------FÖR ROBOTARNA-------------
Funktionen whatsTheSpeed() är en temporär funktion som ska bytas ut framöver. Denna funktion hittar på ett slumpmässigt värde som bilen kör 
under denns maximalahastighet och skickar det till PUBLISHER och TELEREMOTE, för att visa att de är kopplade till nätverket. Ni ska istället
för att använda denna funktion beräkna hur fort roboten kör och skicka det direkt till PUBLISHER.

ALLA robotar är uppkopplade till samma ämne med MQTT-brokern [ andel1 ] i alla meddelanden som kommer till robotarna så är det alltid JSON-objekt 
som innehåller information om vad roboten ska ändra på ( t.ex sin maximala hastighet). I denna information är det alltid ett id som hänvisar
vilken robot som ska ta emot informationen. Robot-569 has 569 som sitt unika id och diverse med Robot-300.

" mqttClient.on("message", (topic, message, packet) => { 
... "
Är funktionen som körs när robotarna tar emot sitt meddelande.

-------------FÖR PUBLISHER-------------
Publisher tar emot meddelanden från ämnet [ andel1337 ].
Publisher har en tom lista som fylls på när den får ett meddelande från en robot tars emot och sätter in all information om roboten som ett JSON-objekt i listan.
Om Publisher tar emot ett meddelande från en robot som redan är med i listan så uppdateras informationen om roboten istället.

Trycks lampan så ändras det till rött och skickar ett failure meddelande till alla uppkopplade system som stänger av dem och diverse om man trycker på lampan igen.

-------------FÖR TELEREMOTE-------------
Teleremote tar emot meddelanden från ämnet [ andel420 ].



 
