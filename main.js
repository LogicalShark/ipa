function createTable(input, order=4) 
{
    var table = [];
    //Make the index table
    for (var i = 0; i<len(input); i++)
    {
        var sub = input.substr(i, order);
        table[sub] = [];
    }              
    //Count the following strings for each string
    for (var j = 0; j<(len(input) - order); j++) 
    {
        var index = input.substr(j, order);
        var next = input.substr(j+order, order);
        if(table[index][next]!=undefined)
            table[index][next]++;
        else
            table[index][next] = 1;
    }
    return table;
}
function createText(first=' ', length=2000, table, order=4) 
{
    var chars = first;
    if(first ==' ')
    {
        chars = table[Math.floor(Math.random()*items.length)];
    }
    var output = chars;
    for (var k = 0; k<(length/order); k++) 
    {
        newchars = createNextChars(table[chars]);
        if(newchars != null)
        {
            chars = newchars;
            output += newchars;
        } 
        else 
        {       
            chars = table[Math.floor(Math.random()*items.length)];
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
        return null;
    var total = total.reduce(sum);
    var rand  = Math.floor(Math.random() * (total - 1)) + 1;
    for (var l = 0; l<array.length; l++) 
    {
        var weight = array[l];
        if (rand <= weight)
            return item;
        rand -= weight;
    }
}
function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject("Msxml2.XMLHTTP");}
  catch (error) {}
  try {return new ActiveXObject("Microsoft.XMLHTTP");}
  catch (error) {}

  throw new Error("Could not create HTTP request object.");
}
function getPhonemes(i)
{
    //Ensure correct format, remove punctuation
    input = i.replace(/\n/g, '');

    var phonA = "";
    var url = "www.speech.cs.cmu.edu/cgi-bin/cmudict?in=";
    var re = /<tt>.*<\\tt><\/div>/;
    var iwords = input.split(" ");
    for (var i = 0, len = iwords.length; i < len; i++)
    {
        var w = iwords[i];
        var request = makeHttpObject();
        request.open("GET", url+w, true);
        request.send(null);
        request.onreadystatechange = function() {
          if (request.readyState == 4)
            document.getElementById("data").innerHTML = request.responseText;
        };
        var out = re.exec(document.getElementById("data").innerHTML);
        console.log(out);
        var final = out.substring(4,out.length-14);
        phonA+=final;
    }
    return phonA;
}
function generate() 
{
    //API Keys
    //(top tier security 👌)
    //103869fa
    //79e16dba710549c398ebc4bec069d0dd

    //Read inputs
    var input = (document.getElementById("input")).value;
    var length = (document.getElementById("length")).value;
    var order = (document.getElementById("order")).value;
    //Get phonemes
    var phonA = getPhonemes(input);            
    //Translate to IPA
    var phonI = transform(phonA);
    //Generate output
    var t = createTable(phonI, order);
    var out = createText(' ', length, t, order);
    console.log(out);
    //Get audio files
    var audios = getAudioFiles(out);
    playAudio(audios);
}
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
            audios.append(c);
            j+=1;
            continue;
        }
        //2 chars left
        var c2 = c + out[j+1];
        if((len - j)==2)
        {
            if(getAFile(c2))
            {
                audios.append(c2);
                j+=2;
            }
            else
            {
                audios.append(c);
                j+=1;
            }
            continue;
        }
        //Default
        var c3 = c2 + out[j+2];
        if(hasAFile(c3))
        {
            audios.append(c3);
            j+=3;
        }
        else if(getAFile(c2))
        {
            audios.append(c2);
            j+=2;
        }
        else
        {
            audios.append(c);
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
function transform(phonA)
{
    //ARPABET and IPA phonemes
    var arpCons = ["P","B","EM","T","D","EN","CH","DH","DX","EL","EN","F","G","H","JH","K","L","M","N","NG","NX","Q","R","S","SH","T","TH","V","w","WH","Y","Z","ZH"];
    var ipaCons = ["p","b","m̩", "t","d","n", "tʃ","ð", "ɾ", "l̩", "n̩", "f","g","h","dʒ","k","l","m","n","ŋ", "ɾ̃", "ʔ","ɹ","s","ʃ", "t","θ", "v","W","ʍ", "j","z","ʒ" ];
    var arpVow = ["AA", "AE", "AH", "AO", "AW", "AX", "AXR", "AY", "EH", "ER", "EY", "IH", "IX", "IY", "OW", "OY", "UH", "UW", "UX"];
    var ipaVow = ["ɑ", "æ", "ʌ", "ɔ", "aʊ", "ə", "ɚ", "aɪ", "ɛ", "ɝ", "eɪ", "ɪ", "ɨ", "i", "oʊ", "ɔɪ", "ʊ", "u", "ʉ"];

    var out = "";
    for(var i = 0; i<phonA.length; i++)
    {
        var el = phonA[i];
        if(arpaCons.includes(el))
            out += ipaCons[arpaCons.indexOf(el)];
        else if(arpaVow.includes(el))
            out += ipaVow[arpaVow.indexOf(el)];
        else
            out+=el;
    }
    return out;
}