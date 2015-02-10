module.exports = function(constants){
return {
  "name": "Send Document",
  "slug": "send_document",
  "type": "action",
  "kind": "task",
  "scripts":{
  	"input":"input.js"
  },
  "fields": {
  	"input": [
      {"key":"i_must_sign","label":"Sender Must Sign?","type":"select","default":"false","input_options":[
        {"label":"No","value":"false"},
        {"label":"Yes","value":"true"}
      ]},
      {"key":"i_must_sign_order","label":"Sender Sign Order","type":"select","default":"first","input_options":[
        {"label":"First","value":"first"},
        {"label":"Last","value":"last"}
        ],
        "description":"If the sender is not signing, this field is ignored."
      },
      {"key":"name","label":"Document Name","required":true},
      {"key":"message","label":"Message","type":"textarea"},
      {"key":"recipient1","label":"First Signatory Email","required":true},
      {"key":"recipient2","label":"Second Signatory Email"},
      {"key":"recipient3","label":"Third Signatory Email"},
  		{"key":"recipient4","label":"Fourth Signatory Email"},
  		{"key":"language","label":"Language","required":true,"default":"en_GB","type":"select","input_options":[
        {"label":"Indonesian (Bahasa Indonesia)","value":"in_ID"},
        {"label":"Czech (Čeština)","value":"cs_CZ"},
        {"label":"Danish (Dansk)","value":"da_DK"},
        {"label":"German (Deutsch)","value":"de_DE"},
        {"label":"English: UK","value":"en_GB"},
        {"label":"English: US","value":"en_US"},
        {"label":"Spanish (Español)","value":"es_ES"},
        {"label":"French (Français)","value":"fr_FR"},
        {"label":"Icelandic (Íslenska)","value":"is_IS"},
        {"label":"Italian (Italiano)","value":"it_IT"},
        {"label":"Malay: Malaysia (Melayu: Bahasa Malaysia)","value":"ms_MY"},
        {"label":"Dutch (Nederlands)","value":"nl_NL"},
        {"label":"Norwegian (Norsk)","value":"no_NO"},
        {"label":"Norwegian: Bokmal (Norsk: bokmål)","value":"nb_NO"},
        {"label":"Norwegian: Nynorsk (Norsk: nynorsk)","value":"nn_NO"},
        {"label":"Polish (Polski)","value":"pl_PL"},
        {"label":"Portuguese: Brazil (Português: Brasil)","value":"pt_BR"},
        {"label":"Portuguese: Portugal (Português: Portugal)","value":"pt_PT"},
        {"label":"Finnish (Suomi)","value":"fi_FI"},
        {"label":"Swedish (Svenska)","value":"sv_SE"},
        {"label":"Vietnamese (Tiếng Việt)","value":"vi_VN"},
        {"label":"Turkish (Türkçe)","value":"tr_TR"},
        {"label":"Russian (Русский)","value":"ru_RU"},
        {"label":"Thai (ไทย)","value":"th_TH"},
        {"label":"Japanese (日本語)","value":"ja_JP"},
        {"label":"Chinese Simplified (简体中文)","value":"zh_CN"},
        {"label":"Chinese Traditional (繁體中文)","value":"zh_TW"},
        {"label":"Korean (한국어)","value":"ko_KR"},
      ]},
      {"key":"document_url","label":"File URL","description":"Below you'll be able to select a document from your EchoSign library. Alternatively, please give a URL where you'd like to retrieve an external document from, eg, https://example.com/mydocument.pdf."},
      {"key":"document_name","label":"File Name","description":" If you've chosen to retrieve an external document, either give a name and the document's correct type (like proposal.docx or presentation.pdf), or just enter a name and we'll try to autodetect the type of file."},
  	],
    "output": [
      {"key":"id","label":"Document ID"}
    ]
  }
};
};
