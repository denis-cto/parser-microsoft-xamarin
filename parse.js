'use strict';

const tabletojson = require('tabletojson');
var fs = require('fs');
var csvWriter = require('csv-write-stream')   // we will write to Stream also
var writer = csvWriter(
    {
        separator: '^',
        newline: '\n',
        headers: undefined,
        sendHeaders: true
    }
);
writer.pipe(fs.createWriteStream('microsoftcomma.csv'));
const fetch = require("node-fetch");
const getUrls =require('get-urls');
const getData = async url => {
    try {
        const response = await fetch(url);
        const json = await response();

    } catch (error) {
        console.log(error);
    }
};
var request = require('request-promise');
var anchorme = require("anchorme").default; // if installed via NPM
let addrs = require("email-addresses")
var striptags = require('striptags');
let timeout=20000;
tabletojson.convertUrl(
    'https://docs.microsoft.com/en-us/xamarin/cross-platform/partners/',
    {stripHtmlFromCells: false},
    async function(tablesAsJson) {
        for (var j=0, len2=tablesAsJson.length; j <len2; j++)
        {
            for (var i = 0, len = tablesAsJson[j].length; i < len; i++) {
                let data=tablesAsJson[j][i];

                let urls=getUrls(data.Partner); // ссылка на сайт партнера


                for (let url of urls) {  // там SET поэтому так его возьмем
                    console.log(url);
                    try {
                        let  response = await request({ url, timeout });

                        // if (error===undefined) {

                        //console.log(response); process.exit();
                        let innerUrls = getUrls(response); // спиздим все ссылки на сайте партнера
                        for (let innerUrl of innerUrls) {
                            if (innerUrl.indexOf('facebook.com') > -1) {
                                data.facebook = innerUrl;
                            }
                            if (innerUrl.indexOf('linkedin.com') > -1) {
                                data.linkedin = innerUrl;
                            }
                            if (innerUrl.indexOf('twitter.com') > -1) {
                                data.twitter = innerUrl;
                            }
                            if (innerUrl.indexOf('mailto:') > -1) {
                                //let email = addrs.parseOneAddress(innerUrl);
                                data.email = innerUrl;
                            }
                            console.log(innerUrl);
                        }
                        // }
                    } catch(error) { console.log(error)};
                    if (data.facebook===undefined) data.facebook='';
                    if (data.linkedin===undefined) data.linkedin='';
                    if (data.twitter===undefined) data.twitter='';
                    if (data.email===undefined) data.email='';


                    console.log(url)
                }
                data.url=data.Partner;
                data.Partner=striptags(data.Partner);
                data.Locations=striptags(data.Locations);
                data.Description=striptags(data.Description);

                console.log(data.Partner);
                writer.write(data);
            }
        }


    }
);
