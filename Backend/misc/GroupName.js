import mongodb from "mongodb"
import dotenv from 'dotenv'
import dataDAO from '../API/dataDAO.js'
dotenv.config({path: "/var/app/current/.env"})

const client = new mongodb.MongoClient(process.env.DB_URL)
let promiseArray = new Array()
await dataDAO.injectDB(client)
await client.connect()
let db = client.db()
let KPOPDB = await db.collection('kpopDB').find({}).project({_id:0,artistFullName_Eng: 1,artistName_KR: 1,artistShortName_Eng: 1}).toArray()
client.close()
KPOPDB = KPOPDB.map((obj) => Object.values(obj)).flat().filter(str => str !== '').map(str => /^[a-zA-Z]+$/.test(str) ? str.toUpperCase() : str )

let CIRCLECHART = ["j-hope","나연 (TWICE)","IVE (아이브)","LE SSERAFIM (르세라핌)","지민, 하성운","레드벨벳(Red Velvet)","Kep1er (케플러)","리사 (LISA)","NCT DREAM",
"태연 (TAEYEON)","Stray Kids (스트레이 키즈)","GOT the beat","aespa","STAYC(스테이씨)","프로미스나인 (fromis_9)","TREASURE (트레저)","ITZY (있지)","브레이브걸스 (Brave Girls)","MSG워너비(M.O.M)","위너(WINNER)","BIGBANG (빅뱅)","Weeekly (위클리)","지효 (TWICE)","비투비 (BTOB)","휘인 (Whee In)","뱀뱀 (BamBam)","소녀시대-Oh!GG","NCT U",
"오마이걸 (OH MY GIRL)","KARD","제니 (JENNIE)","미연 ((여자)아이들)","IZ*ONE (아이즈원)","NCT 127","로제 (ROSE)","iKON","VIVIZ (비비지)","마마무 (Mamamoo)","카이 (KAI)","NCT U","WSG워너비","2NE1 (투애니 원)","ATEEZ (에이티즈)","NATURE (네이처)","tripleS (트리플에스)","더보이즈(THE BOYZ)", "레드벨벳(Red Velvet), aespa" , "효연 (HYO)","화사(Hwa Sa)","키 (Key)", "키 (KEY)", "카라 (KARA)", "카이 (KAI), 슬기 (SEULGI), 제노 (JENO), 카리나 (KARINA)","체리블렛 (Cherry Bullet)","진 (JIN)","조이 (JOY)","준 (SEVENTEEN)","EVERGLOW (에버글로우)","Apink 초봄 (에이핑크 초봄)","WayV","리아 (ITZY)","Billlie","NCT 2021","마마돌 (M.M.D)","마마무(Mamamoo)","부석순 (SEVENTEEN)","소녀시대-태티서 (Girls’ Generation-TTS)","슬기 (SEULGI)","슈퍼주니어 (Super Junior)","에픽하이 (EPIK HIGH)" ,"위너(WINNER)"]

let NAVERCHART = ["(여자) 아이들","(여자)아이들","ATEEZ(에이티즈)","Apink 초봄 (에이핑크 초봄)","Apink 초봄(에이핑크 초봄)", "BIGBANG (빅뱅)","Billlie(빌리)","CLASS:y(클라씨)","DAY6(데이식스)","FTISLAND","GOT the beat","H1-KEY(하이키)","H.O.T.","ITZY(있지)","IVE(아이브)","IZ*ONE(아이즈원)","Kep1er(케플러)","LE SSERAFIM (르세라핌)","MAVE: (메이브)","MSG워너비(M.O.M)","NCT 127","NCT DREAM","NCT U","NewJeans","P1Harmony","RM","Red Velvet (레드벨벳)","SHINee (샤이니)","STAYC(스테이씨)","SUPER JUNIOR (슈퍼주니어)","Stray Kids (스트레이 키즈)","TWICE(트와이스)","VIVIZ(비비지)","VIXX(빅스)","WSG워너비","WSG워너비 조별경연(대청봉)","WSG워너비 조별경연(비로봉)","WSG워너비 조별경연(신선봉)","WSG워너비 조별경연(할미봉)","WSG워너비(4FIRE)","WSG워너비(가야G)","WSG워너비(오아시소)","Weeekly(위클리)","cignature(시그니처)","tripleS(트리플에스)","다이아(DIA)","더보이즈(THE BOYZ)","데이브레이크 (DAYBREAK)","라붐(LABOUM)","로제 (ROSÉ)","로켓펀치(Rocket Punch)","리사 (LISA)","리아(ITZY)","문별(마마무)","미연((여자)아이들)","민니((여자)아이들)","박우진(AB6IX)","박지원 (프로미스나인)","서다현(tripleS)","세림(CRAVITY)","세미(cignature)","소녀시대 (GIRLS' GENERATION)","소녀시대-태티서 (Girls' Generation-TTS)","솔라(마마무)","슬기 (SEULGI)","승훈(CIX)","승희 (오마이걸)","아이린 (IRENE)","안유진(IVE)","여자친구(GFRIEND)","오마이걸(OH MY GIRL)","우기((여자)아이들)","윈터(WINTER)","유아(오마이걸)","유주(YUJU)","은하(EUNHA)","이달의 소녀 (희진)","이서(IVE)","장원영(IVE)","정모(CRAVITY)","조이 (JOY)","지효 (TWICE)","진영 (GOT7)","최유정 (Weki Meki)","츄 (이달의 소녀)","츄(Chuu)","츄(이달의 소녀)","카드(KARD)","카라(Kara)","카리나(KARINA)","카이 (KAI)","태연 (TAEYEON)","티아라(T-ara)","틴 탑(Teen Top)","퍼플키스(PURPLE KISS)","화사(Hwa Sa)","효정(오마이걸)","휘인(Whee In)"]

let MELONCHART =  ["Red Velvet (레드벨벳)","Red Velvet (레드벨벳), aespa","WSG워너비 (4FIRE)","WSG워너비 (가야G)","WSG워너비 (오아시소)","WSG워너비(4FIRE)","민니 ((여자)아이들)","소녀시대 (GIRLS' GENERATION)","지민","지수 (JISOO)","H1-KEY (하이키)","DAY6 (데이식스)","기현 (몬스타엑스)","더보이즈 (THE BOYZ)","로꼬, 화사 (Hwa Sa)"]

KPOPDB = KPOPDB.concat(CIRCLECHART,NAVERCHART,MELONCHART)

export default KPOPDB;


