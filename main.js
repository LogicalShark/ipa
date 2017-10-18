//---------------------------------Markov chains---------------------------------
function createTable(input,order) 
{
    order = parseInt(order);
    var table = {};
    var size = 0;
    //Make the index table
    for (var i = 0; i<(input.length - order); i++)
    {
        var sub = input.substr(i, order);
        table[sub] = {};
        table[sub]["SIZE"] = 0;
        size++;
    }
    //Count the following strings for each string
    for (var j = 0; j<(input.length - order - order); j++) 
    {
        var index = input.substr(j, order);
        var k = j+order+0
        var next = input.substr(k, order);
        if(table[index][next]==undefined && next.length>0)
        {
            table[index][next] = 1;
            table[index]["SIZE"] += 1;
        }
        else
        {
            table[index][next] += 1;
            table[index]["SIZE"] += 1;
        }
    }
    return [table,size];
}

function createText(start,length,table,order,size) 
{
    var keys = Object.keys(table);
    var chars = start;
    if(start =="" || table.start == undefined)
    {
        chars = createNextChars(table[keys[Math.floor(Math.random()*size)]]);
    }
    var output = chars;
    for (var k = 0; k<(length/order); k++) 
    {
        newchars = createNextChars(table[chars]);
        if(newchars!=undefined && newchars.length>0)
        {
            chars = newchars;
            output += newchars;
        }
        else 
        {       
            chars = createNextChars(table[keys[Math.floor(Math.random()*size)]]);
        }
    }
    return output;
}

function sum(a,b)
{
    return a+b;
}

function createNextChars(array)
{
    if(array==undefined)
        return "";
    if(array["SIZE"]==undefined)
        return "";
    var rand  = Math.floor(Math.random() * (array["SIZE"] - 1));
    for (var k in array)
    {
        if(k!="SIZE")
        {
            var weight = array[k];
            if (rand <= weight)
            {
                return k;
            }
            rand -= weight;       
        }
    }
}

function nextLetter(s)
{
    if(s==undefined || s.length == 0)
        return "";
    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function(a){
        var c= a.charCodeAt(0);
        switch(c){
            case 90: return 'z';
            case 122: return 'z';
            default: return String.fromCharCode(++c);
        }
    });
}

//---------------------------------Get/play audio---------------------------------
function getAudioFiles(out)
{
    audios = [];
    var j = 0;
    var len = out.length;
    while(j<len)
    {
        //1 char left
        var c = out[j];
        if((len - j)==1)
        {
            audios.push(c);
            j+=1;
            continue;
        }
        //2 chars left
        var c2 = c + out[j+1];
        if((len - j)==2)
        {
            if(getAFile(c2))
            {
                audios.push(c2);
                j+=2;
            }
            else
            {
                audios.push(c);
                j+=1;
            }
            continue;
        }
        //Default
        var c3 = c2 + out[j+2];
        if(hasAFile(c3))
        {
            audios.push(c3);
            j+=3;
        }
        else if(getAFile(c2))
        {
            audios.push(c2);
            j+=2;
        }
        else
        {
            audios.push(c);
            j+=1;
        }
    }
}

function playAudio(audios)
{
    for(var i = 0; i<audios.length; i++)
    {
        var p = audios[i];
        var a = new Audio(audioFiles[p]);
        a.play();
    }
}

function hasAFile(chars)
{
    var audioFiles = []
    if(audioFiles.includes(chars))
        return true;
    return false;
}

//---------------------------------ARPABET to IPA translation---------------------------------
function uniques(a)
{
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

function transform(phonA)
{
    //ARPABET and IPA phonemes
    var arpCons = ["P","B","EM","T","D","EN","CH","DH","DX","EL","EN","F","G","H","HH","JH","K","L","M","N","NG","NX","Q","R","S","SH","T","TH","V","w","WH","Y","Z","ZH"];
    var ipaCons = ["p","b","m̩", "t","d","n", "tʃ","ð", "ɾ", "l̩", "n̩", "f","g","h","h", "dʒ","k","l","m","n","ŋ", "ɾ̃", "ʔ","ɹ","s","ʃ", "t","θ", "v","W","ʍ", "j","z","ʒ" ];
    var arpVow = ["AA","AE","AH","AO","AW","AX","AXR","AY","EH","ER","EY","IH","IX","IY","OW","OY","UH","UW","UX"," "];
    var ipaVow = ["ɑ", "æ", "ʌ", "ɔ", "aʊ","ə", "ɚ",  "aɪ", "ɛ", "ɝ","eɪ","ɪ", "ɨ", "i", "oʊ","ɔɪ","ʊ", "u", "ʉ", " "];

    var out = "";
    for(var i = 0; i<phonA.length; i++)
    {
        var el = phonA[i];
        if(el.length==3)
            el = el.substr(0,2);
        if(el=="")
            continue;
        if(arpCons.includes(el))
            out += ipaCons[arpCons.indexOf(el)];
        else if(arpVow.includes(el))
            out += ipaVow[arpVow.indexOf(el)];
        // else
            // out+=el;
    }
    return out;
}

//---------------------------------Get pronunciation data---------------------------------
function writeData()
{
    var database = firebase.database();
    var dict = (document.getElementById("data").innerHTML).split("\n");
    for (var i = 0; i < dict.length; i++)
    {
        var l = dict[i];
        var re = new RegExp("^[A-Z]+ ", "g");
        if(l.match(re))
        {
            var word = l.match(re)[0];
            var apronu = l.replace(re,"");
            var ipronu = transform(apronu);
            firebase.database().ref('ARP/' + word).set({
                phonemes : apronu
            });
            firebase.database().ref('IPA/' + word).set({
                phonemes : ipronu
            });            
        }
    }
}

function makeRequest(url) 
{
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
            if (req.status == 200) 
            {
                resolve(req.responseText);
            }
            else 
            {
                reject(Error(req.statusText));
            }
        };
        req.onerror = function() {
            reject(Error("Network Error"));
        };
        req.send();
    });
}

//---------------------------------Main functions---------------------------------

function readInput(input,length,order,start,checked)
{
    var sel = document.getElementById("file");
    var file = sel.options[sel.selectedIndex].value;
    makeRequest('/ipa/texts/'+file+'.txt').then(function(response) {
        input = input + response;
        if(checked)
            generateIPA(input,length,order,start);
        else
            generateText(input,length,order,start);
    },
    function(error) {
      console.error("Input File Error!", error);
    });
}

function evaluateInput(input,length,order,start,dict)
{
    dict = dict.split("\n");
    //Bucket by first letter
    var alphabetIndicies = {A:127,B:7362,C:17044,D:27737,E:35475,F:40208,G:45422,H:51129,I:57571,J:60959,
                            K:62628,L:66784,M:72292,N:81821,O:85026,P:88008,Q:96254,R:96710,S:104038,
                            T:118031,U:123666,V:125466,W:127796,X:132182,Y:132261,Z:132989,z:133906};
    var iwords = input.split(" ");
    var phonA = [];
    for (var i = 0, len = iwords.length; i < len; i++)
    {
        var w = iwords[i];
        var re = new RegExp("^"+w+" ", "g");
        for(var j = alphabetIndicies[w.charAt(0)]; j<alphabetIndicies[nextLetter(w.charAt(0))]; j++)
        {
            var wordline = dict[j];
            if(wordline.match(re))
            {
                phonA.push(wordline.replace(re,""))
                phonA.push(" ");
                break;
            }
        }
    }
    var flattened = [];
    for(var n = 0; n<phonA.length; n++)
    {
        var phons = phonA[n].split(" ");
        flattened = flattened.concat(phons).concat(" ");
    }
    //Translate to IPA
    var phonI = transform(flattened);
    //Generate output
    var t = createTable(phonI, order);
    var out = createText(start, length, t[0], order, t[1]);
    document.getElementById("output").value = out;
}
function generateIPA(input,length,order,start) 
{
    input = input.toUpperCase();
    input = input.replace(/[^\w\s]/g,"");
    input = input.replace(/\s+/g," ");
    //Ensure correct format, remove punctuation
    makeRequest('/ipa/cmudict.txt').then(function(response) {
        evaluateInput(input,length,order,start,response);
    },
    function(error) {
      console.error("Dictonary File Error!", error);
    });
}

function generateText(input,length,order,start)
{
    //Generate output
    var t = createTable(input, order);
    var out = createText(start, length, t[0], order, t[1]);
    document.getElementById("output").value = out;
}

function generate()
{
    var input = (document.getElementById("input")).value;
    var length = (document.getElementById("length")).value;
    if(length.length == 0)
        length = 1000;
    var order = (document.getElementById("order")).value;
    if(order == "" || order == "0")
        order = 4;
    var start = (document.getElementById("start")).value;
    readInput(input,length,order,start,document.getElementById("cb").checked);
}
