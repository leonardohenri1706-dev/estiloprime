/* ============ DADOS ============ */
const IMG=(id,w)=>"https://images.unsplash.com/photo-"+id+"?auto=format&fit=crop&w="+(w||900)+"&q=85";

const slidesData=[
 {badge:"[ STREETWEAR ESSENTIALS // 240G/M² ]",
  lines:[{t:"CAMISETAS OVERSIZED",c:""},{t:"Boxy Cut",c:"tx-serif acc"},{t:"OMBRO CAÍDO & GOLA GROSSA.",c:"txt-mut"}],
  desc:"Algodão penteado pesado com caimento reto e imponente. A silhueta que define o streetwear atual.",
  cta:"Ver Oversized",piece:"Boxy White Tee — R$ 79,90"},
 {badge:"[ GAME DAY // MANDA QUEM VESTE ]",
  lines:[{t:"CAMISAS DE TIME",c:""},{t:"Game Day",c:"tx-serif acc"},{t:"ORGULHE DE VERDADE.",c:"txt-mut"}],
  desc:"Jerseys retrô e atuais com estampa em relevo. Do estádio ao rolê, presença garantida.",
  cta:"Ver Catálogo",piece:"Retrô Nº10 Home — R$ 119,90"},
 {badge:"[ CASUAL RESORT // ITAIÇABA — CE ]",
  lines:[{t:"BERMUDAS EM LINHO",c:""},{t:"& Alfaiataria",c:"tx-serif acc"},{t:"FRESCO & SOFISTICADO.",c:"txt-mut"}],
  desc:"Linho nobre com corte acima do joelho e cós com cordão de ajuste. Elegância para o clima cearense.",
  cta:"Ver Bermudas",piece:"Linho Areia Alfaiataria — R$ 79,90"},
 {badge:"[ SMART CASUAL // TOQUE GELADO ]",
  lines:[{t:"POLOS TECH &",c:""},{t:"Smart Casual",c:"tx-serif acc"},{t:"DE ALTA PRESENÇA.",c:"txt-mut"}],
  desc:"Malha estruturada com elastano, zíper frontal inoxidável e caimento alinhado ao peitoral.",
  cta:"Ver Polos",piece:"Polo Tech Black Zíper — R$ 89,90"}
];

const CAT_META={
 esporte:{label:"Esporte",tag:"GAME DAY"},
 polos:{label:"Polos Tech",tag:"SMART CASUAL"},
 oversized:{label:"Streetwear",tag:"240G/M²"},
 bermudas:{label:"Bermudas",tag:"RESORT"},
 boneis:{label:"Bonés",tag:"TOPPER"}
};

const products=[
 {id:1,name:"Polo Tech Black Zíper",cat:"polos",price:89.90,oldPrice:119.90,badge:"BEST SELLER",img:"1620799140408-edc6dcb6d633",desc:"Malha estruturada anti-suor, zíper frontal inoxidável e gola canelada firme.",sizes:["P","M","G","GG"],stock:{P:3,M:6,G:4,GG:2}},
 {id:2,name:"Polo Navy Blue Classic",cat:"polos",price:79.90,oldPrice:99.90,badge:"CLÁSSICO",img:"1585790641228-36685639c56e",desc:"Azul-marinho versátil, punho canelado e botões madrepérola.",sizes:["P","M","G","GG"],stock:{P:4,M:6,G:4,GG:2}},
 {id:3,name:"Piquet Heritage Rack",cat:"polos",price:84.90,oldPrice:109.90,badge:"HERITAGE",img:"1626447852910-316278832a8a",desc:"Piquet de gramatura alta no tom perfeito para o escritório e o bar.",sizes:["P","M","G","GG"],stock:{P:3,M:5,G:4,GG:2}},
 {id:4,name:"Camiseta Oversized Vintage White",cat:"oversized",price:79.90,oldPrice:99.90,badge:"LANÇAMENTO",img:"1574180566232-aaad1b5b8450",desc:"Boxy cut, ombro caído e gola grossa 3cm. Algodão penteado 240g/m².",sizes:["P","M","G","GG"],stock:{P:5,M:8,G:7,GG:3}},
 {id:5,name:"Graphic Print Purple Haze",cat:"oversized",price:89.90,oldPrice:114.90,badge:"STREET",img:"1626806851009-c98659eb1af0",desc:"Estampa gráfica em silk fosco sobre malha pesada 240g/m².",sizes:["P","M","G","GG"],stock:{P:3,M:5,G:4,GG:2}},
 {id:6,name:"Bone White Heavyweight Duo",cat:"oversized",price:74.90,oldPrice:94.90,badge:"CLEAN",img:"1521572163474-6864f9cf17ab",desc:"Branco giz pesado, caimento reto — a base branca definitiva.",sizes:["P","M","G","GG"],stock:{P:4,M:6,G:5,GG:2}},
 {id:7,name:"Jump Black Essential Tee",cat:"oversized",price:69.90,oldPrice:92.90,badge:"CORE",img:"1618453292507-4959ece6429e",desc:"Preto profundo 240g/m², gola reforçada que não deforma.",sizes:["P","M","G","GG"],stock:{P:5,M:7,G:5,GG:3}},
 {id:8,name:"Camisa Retrô Nº10 Home",cat:"esporte",price:119.90,oldPrice:149.90,badge:"GAME DAY",img:"1759308553457-6f7f0850d9cd",desc:"Jersey retrô número 10 nas costas, tecido respirável e relevo premium.",sizes:["P","M","G","GG"],stock:{P:3,M:6,G:4,GG:2}},
 {id:9,name:"Camisa Team Blackout Field",cat:"esporte",price:109.90,oldPrice:139.90,badge:"AWAY KIT",img:"1517466787929-bc90951d0974",desc:"Preto e azul elétrico, corte atlético para o dia de jogo.",sizes:["M","G","GG"],stock:{M:4,G:4,GG:2}},
 {id:10,name:"Camisa Canarinho Street",cat:"esporte",price:114.90,oldPrice:144.90,badge:"SELEÇÃO",img:"1745895400964-e8108fbb112b",desc:"Amarelo-verde para torcer com estilo dentro e fora do campo.",sizes:["P","M","G","GG"],stock:{P:3,M:5,G:3,GG:1}},
 {id:11,name:"Camisa Verde Rua 2026",cat:"esporte",price:104.90,oldPrice:134.90,badge:"DROP",img:"1772450235863-996680ddb732",desc:"Verde intenso com gola esportiva — verão 2026.",sizes:["P","M","G"],stock:{P:3,M:5,G:3}},
 {id:12,name:"Bermuda Linho Areia Alfaiataria",cat:"bermudas",price:79.90,oldPrice:109.90,badge:"ALFAIATARIA",img:"1562247879-0eac107b7e76",desc:"Linho misto, corte acima do joelho, cós com cordão de ajuste.",sizes:["38","40","42","44"],stock:{"38":3,"40":5,"42":4,"44":2}},
 {id:13,name:"Bermuda Surf Plaid",cat:"bermudas",price:69.90,oldPrice:89.90,badge:"PRAIA",img:"1617953644310-e690da9be982",desc:"Xadrez casual de secagem rápida — do mar ao quiosque.",sizes:["M","G","GG"],stock:{M:4,G:4,GG:2}},
 {id:14,name:"Bermuta Beach Green Core",cat:"bermudas",price:64.90,oldPrice:84.90,badge:"CORE",img:"1621496503717-095a410e1566",desc:"Verde oliva essencial com bolsos faca funcionais.",sizes:["P","M","G","GG"],stock:{P:3,M:5,G:4,GG:2}},
 {id:15,name:"Bermuda Denim Indigo Relax",cat:"bermudas",price:89.90,oldPrice:114.90,badge:"DENIM",img:"1617951639883-6a10179adb1e",desc:"Denim leve lavado, modelagem relaxada acima do joelho.",sizes:["38","40","42"],stock:{"38":3,"40":4,"42":2}},
 {id:16,name:"Boné Dad Hat Minimalist EP",cat:"boneis",price:49.90,oldPrice:69.90,badge:"ACESSÓRIO",img:"1516826957135-700dedea698c",desc:"Sarja peletizada, fivela metálica envelhecida e bordado EP.",sizes:["Único"],stock:{"Único":10}},
 {id:17,name:"Trucker Night Studio Snapback",cat:"boneis",price:59.90,oldPrice:79.90,badge:"STREET",img:"1777447458522-79367cd8e5d3",desc:"Aba reta, tela traseira e patch frontal bordado.",sizes:["Único"],stock:{"Único":8}},
 {id:18,name:"Flat Cap Vintage Walker",cat:"boneis",price:64.90,oldPrice:84.90,badge:"VINTAGE",img:"1761494355056-a7fa8bde0365",desc:"Boina reta vintage para compor looks de meia-estação.",sizes:["Único"],stock:{"Único":5}}
];

const LOOKS=[
 {tag:"SMART CASUAL",title:"Retrato Editorial",desc:"Presença natural para o dia a dia refinado.",img:"1506794778202-cad84cf45f1d"},
 {tag:"RESORT WEAR",title:"Blazer + Alfaiataria Leve",desc:"Elegância despretensiosa para a noite cearense.",img:"1552374196-1ab2a1c593e8"},
 {tag:"SUMMER SHORTS",title:"Shorts Praia + Tee Branca",desc:"Frescor total com caimento alinhado.",img:"1562247879-0eac107b7e76"},
 {tag:"GAME DAY",title:"Jersey Doorway Fit",desc:"Número nas costas, atitude na frente.",img:"1772972321294-f500e4c11e30"},
 {tag:"CAP STREET",title:"Baseball Cap Night",desc:"Topper firme sob a luz da cidade.",img:"1777447458522-79367cd8e5d3"},
 {tag:"WHITE CORE",title:"Duo de Tees Essentials",desc:"A base branca que nunca erra.",img:"1521572163474-6864f9cf17ab"}
];

const IG_FALLBACK=[
 "1759308553457-6f7f0850d9cd","1574180566232-aaad1b5b8450","1562247879-0eac107b7e76",
 "1777447458522-79367cd8e5d3","1620799140408-edc6dcb6d633","1506794778202-cad84cf45f1d"
];
