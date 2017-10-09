//Markov chains
function createTable(input, order) 
{
    order = parseInt(order);
    var table = {};
    var size = 0;
    //Make the index table
    for (var i = 0; i<(input.length - order); i++)
    {
        var sub = input.substr(i, order);
        table[sub] = {};
        table[sub]["SIZE"] = 1;
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
function createText(first, length, table, order, size) 
{
    var keys = Object.keys(table);
    var chars = first;
    if(first =="" || table.first == undefined)
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

//Get pronunciation data
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
function getPhonemes(i)
{
    //Ensure correct format, remove punctuation
    input = i.replace(/\n/g, '');
    input = i.replace(/\*/g, '');
    document.getElementById("data").value = "";

    var phonA = [];
    var iwords = input.split(" ");
    var database = firebase.database();
    for (var i = 0, len = iwords.length; i < len; i++)
    {
        var w = iwords[i];
        w = w.replace(/\(/,"\\(");
        w = w.replace(/\)/,"\\)");
        w = w.replace(/\[/,"\\[");
        w = w.replace(/\]/,"\\]");
        w = w+" ";
        console.log(w);
        database.ref('/ARP/'+w).once('value').then(function(snapshot) {
            if(snapshot.val()!=null && snapshot.val()!=undefined)
            {
                var p = snapshot.val().phonemes;
                console.log(p);
                phonA.push(p);
                document.getElementById("data").value += p;
            }
        });

        phonA.push(" ");
    }
    console.log(phonA);
    return phonA;
}

//Get/play audio
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
//ARPABET to IPA translation
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

//Main functions
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
function readInputs()
{
    var input = (document.getElementById("input")).value;
    var length = (document.getElementById("length")).value;
    if(length == "")
        length = 1000;
    var order = (document.getElementById("order")).value;
    if(order == "")
        order = 4;
    var start = (document.getElementById("start")).value;
    return [input,length,order,start];
}
function generateIPA() 
{
    //Read inputs
    var x = readInputs();
    var input = x[0].toUpperCase();
    input = input.replace(/[^\w\s]/g,"");
    var length = x[1];
    var order = x[2].value;
    var start = x[3];
    //Get phonemes
    var phonA = getPhonemes(input);
    while(document.getElementById("data").value=="")
    {

    }
    var phonA = document.getElementById("data").value;
    document.getElementById("data").value = "";
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
    console.log(t);
    var out = createText(start, length, t[0], order, t[1]);
    console.log(out);
}
function generateText()
{
    //Read inputs
    var x = readInputs();
    var input = x[0];
    var length = x[1];
    var order = x[2].value;
    var start = x[3];
    //Generate output
    var t = createTable(input, order);
    console.log(t);
    var out = createText(start, length, t[0], order, t[1]);
    console.log(out);
}

        // var re = new RegExp("^"+w+" ", "g");
        // for(var j = alphabetIndicies[w[0]]; j<alphabetIndicies[nextLetter(w[0])]; j++)
        // {
        //     var wordline = dict[j];
        //     if(wordline.match(re))
        //     {
        //         phonA.push(wordline.replace(re,""))
        //         break;
        //     }
        // }
    // var dict = (document.getElementById("data").innerHTML).split("\n");
    // var alphabetIndicies = {A:127,B:7362,C:17044,D:27737,E:35475,F:40208,G:45422,H:51129,I:57571,J:60959,
    //                         K:62628,L:66784,M:72292,N:81821,O:85026,P:88008,Q:96254,R:96710,S:104038,
    //                         T:118031,U:123666,V:125466,W:127796,X:132182,Y:132261,Z:132989,z:133906};