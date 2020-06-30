const request = require('request');
const cheerio = require('cheerio');

var fs = require('fs');
var data = {}
data.table = []

const adress = new Set();
const kontakt = new Set();
const link = new Set();
const workTitle = new Set();
const names = new Set();
const numbers = new Set();

//TODO Fixa output JSON format, hämta pdf URL, Lägg till modules för snyggare kod,
// hämta relevant data med each() och spara i sets, bättre namn för variabler 

const originalUrl = 'https://www.afafastigheter.se/Fastigheter/Vara_fastigheter';
//Kallar först bashemsidan för att hämta URls
request(originalUrl, (error, response, html) => {
	if(!error && response.statusCode == 200){

		const $ = cheerio.load(html, {xmlMode: true})
		const allData = [];
		//URLs och koordinater är gömda i ett script. Hämtar, parsear och sparas i urlParsed och kordParse
		$('script').each((i, el) => {
			allData[i] = $(el).html();
		});

		allData.join(', ');
		var allDataString = allData.toString();
		var parseData = allDataString.replace(/:/g,' ');  //Onödig replace som gjorde parse lättare
		parseData = parseData.replace(/"/g,' ')

		var url2 =/\/fastigheter\/([^,]*)/g
		var kord =/kord\s\s([^}]*)/g                      //Hittade koords här också
		var kordParse = parseData.match(kord);
		var urlParsed = parseData.match(url2);
		var urlLength = urlParsed.length;

		//Gå igenom alla individuella hemsidor, hämta data och skriv till output.json
		for(let i=0; i < urlLength; i++){
			const tempUrl = 'https://www.afafastigheter.se' + urlParsed[i];
			request(tempUrl, (error, response, html) => {
				if(!error && response.statusCode == 200){

					var str, $ = cheerio.load(html, {xmlMode: true}); 

					const title = $('.wrapper h1').text();
					const a = $('#ContentPlaceHolder1_rpFakta_p_0').text();
					const wTitle1 = $('#ContentPlaceHolder1_kontaktpersoner_rp_h2titel_0').text();
					const wTitle2 = $('#ContentPlaceHolder1_kontaktpersoner_rp_h2titel_1').text();

					$('.row h4').each((i, el) => {
						names.add($(el).text());
					});
					const name1 = $('#ContentPlaceHolder1_kontaktpersoner_rp_h4namn_0').text();
					const name2 = $('#ContentPlaceHolder1_kontaktpersoner_rp_h4namn_1').text();

					const number1 = $('#ContentPlaceHolder1_kontaktpersoner_rp_ptelefon_0').text();
					const number2 = $('#ContentPlaceHolder1_kontaktpersoner_rp_ptelefon_1').text();


					const typ = $('#ContentPlaceHolder1_rpFakta_p_1').text();
					const area = $('#ContentPlaceHolder1_rpFakta_p_2').text();
					const year = $('#ContentPlaceHolder1_rpFakta_p_3').text();

					const beskrivning = $('#ContentPlaceHolder1_rpText_p_0').text();

					//Här borde vi använda en each() som går igenom alla bilder
					const picture1 = $('.slides').children().find('img').attr('src');
					const picture2 = $('.slides').children().next().find('img').attr('src');
					const picture3 = $('.slides').children().next().next().find('img').attr('src');
					const picture4 = $('.slides').children().next().next().next().find('img').attr('src');
					const picture5 = $('.slides').children().next().next().next().next().find('img').attr('src');
					const picture6 = $('.slides').children().next().next().next().next().next().find('img').attr('src');


					//kan testa:
					//$('.slides [id="ContentPlaceholder1_bilder_rp_img0"').attr('src')

					const pdf = $('.btn-group [id="ContentPlaceHolder1_lbPDF"]').attr('href');
									
					var obj = {
						Title: title,
						Adress: a,
						Kontaktpersoner: wTitle1 + " " + name1 + " " + number1 + " " + wTitle2 + " " + name2 + " " + number2,
						Koordinater: kordParse[i] + "}",
						Url: "https://www.afafastigheter.se" + urlParsed[i],
						Typ: typ,
						Area: area,
						Byggår: year,
						Beskrivning: beskrivning,
						Bilder: picture1 + "                                " + picture2 + "                                " + picture3 + "                                " + picture4 + "                                " + picture5 + "                                " + picture6,
						Pdf: pdf

					}

					data.table.push(obj)
					fs.writeFile ("output.json", JSON.stringify(data), function(err){
						if (err) throw err;
						console.log('complete');
					});
				}
			});
			
		}
	}
});
