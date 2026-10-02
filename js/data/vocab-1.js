// 형식: 터키어 | 한국어 뜻 | 품사 | 예문 | 예문 번역 | 플래그 | 메모
// 플래그: soft(자음 연화) hard(연화 안 함) drop(모음 탈락) front(앞모음 조화 예외) proper(고유명사) id=… alt=…(허용 답안, / 구분) nodrill

export const RAW1 = {
  greet: `
merhaba | 안녕하세요 | int | Merhaba, ben Mina. | 안녕하세요, 저는 미나예요.
selam | 안녕(친근하게) | int | Selam, ne haber? | 안녕, 별일 없어?
günaydın | 좋은 아침이에요 | int | Günaydın, anne! | 좋은 아침이에요, 엄마!
iyi günler | 좋은 하루 되세요 | phr | İyi günler, hoşça kalın! | 좋은 하루 되세요, 안녕히 계세요!
iyi akşamlar | 좋은 저녁이에요 | phr | İyi akşamlar, hoş geldiniz. | 좋은 저녁이에요, 어서 오세요.
iyi geceler | 잘 자요, 안녕히 주무세요 | phr | İyi geceler, yarın görüşürüz. | 잘 자, 내일 봐.
hoşça kal | 잘 있어(떠나는 사람이) | phr | Hoşça kal, görüşürüz! | 잘 있어, 또 봐! | | 여러 명이나 윗사람에게는 Hoşça kalın.
güle güle | 잘 가(남는 사람이) | phr | Güle güle, yine bekleriz! | 잘 가요, 또 오세요!
görüşürüz | 또 봐요 | phr | Yarın görüşürüz! | 내일 봐요!
nasılsın | 어떻게 지내?(반말) | phr | Merhaba Ali, nasılsın? | 안녕 알리, 어떻게 지내?
nasılsınız | 어떻게 지내세요?(존댓말) | phr | Günaydın hocam, nasılsınız? | 안녕하세요 선생님, 어떻게 지내세요?
iyiyim | 잘 지내요 | phr | İyiyim, teşekkürler. | 잘 지내요, 고마워요.
teşekkürler | 고마워요 | int | Çok teşekkürler! | 정말 고마워요!
teşekkür ederim | 감사합니다 | phr | Yardımınız için teşekkür ederim. | 도와주셔서 감사합니다.
sağ ol | 고마워(친근하게) | phr | Sağ ol, kardeşim! | 고마워, 친구야! | | 존댓말은 Sağ olun.
rica ederim | 천만에요 | phr | Rica ederim, ne demek! | 천만에요, 별말씀을요!
lütfen | ~해 주세요, 부디 | adv | Bir çay, lütfen. | 차 한 잔 주세요.
evet | 네, 예 | int | Evet, anlıyorum. | 네, 이해해요.
hayır | 아니요 | int | Hayır, teşekkürler. | 아니요, 괜찮아요.
tamam | 좋아요, 알겠어요 | int | Tamam, yarın görüşürüz. | 좋아요, 내일 봐요.
özür dilerim | 죄송합니다 | phr | Özür dilerim, geç kaldım. | 죄송해요, 늦었어요.
pardon | 실례해요, 미안해요 | int | Pardon, bir sorum var. | 실례지만, 질문이 하나 있어요.
affedersiniz | 실례합니다(정중하게) | phr | Affedersiniz, tuvalet nerede? | 실례합니다, 화장실이 어디예요?
hoş geldiniz | 어서 오세요, 환영합니다 | phr | Türkiye'ye hoş geldiniz! | 튀르키예에 오신 것을 환영합니다! | | 반말은 Hoş geldin.
hoş bulduk | (환영 인사에 답하며) 반가워요 | phr | — Hoş geldin! — Hoş bulduk! | — 어서 와! — 반가워!
memnun oldum | 만나서 반가워요 | phr | Tanıştığımıza memnun oldum. | 만나서 반가웠어요.
afiyet olsun | 맛있게 드세요 | phr | Yemek hazır, afiyet olsun! | 음식 준비됐어요, 맛있게 드세요!
kolay gelsin | 수고하세요 | phr | Kolay gelsin, usta! | 수고하세요, 기사님! | | 일하는 사람에게 건네는 인사. 한국어 '수고하세요'와 쓰임이 거의 같아요.
geçmiş olsun | 빨리 나으세요, 고생 많았어요 | phr | Hastasın, geçmiş olsun! | 아프구나, 얼른 나아! | | 아프거나 안 좋은 일을 겪은 사람에게 해요.
maşallah | 어머 대단해요(칭찬·축복) | int | Maşallah, çok güzel bir bebek! | 어머, 정말 예쁜 아기네요!
inşallah | 그러길 바라요 | int | Yarın hava güzel olur inşallah. | 내일 날씨가 좋았으면 좋겠어요.
tebrikler | 축하해요 | int | Sınavı geçtin, tebrikler! | 시험에 붙었구나, 축하해!
iyi şanslar | 행운을 빌어요 | phr | Sınavda iyi şanslar! | 시험 잘 봐!
iyi yolculuklar | 즐거운 여행 되세요 | phr | İyi yolculuklar, dikkatli ol! | 즐거운 여행 되고, 조심해!
buyurun | 여기 있어요, 어서 오세요 | phr | Buyurun, ne istersiniz? | 어서 오세요, 무엇을 드릴까요? | | 물건을 건넬 때, 손님을 맞을 때, 말을 청할 때 두루 써요.
efendim | 네?(되물을 때), 손님 | phr | Efendim? Anlamadım. | 네? 못 알아들었어요.
ne haber | 별일 없어? | phr | Selam, ne haber? | 안녕, 별일 없어?
fena değil | 나쁘지 않아요 | phr | — Nasılsın? — Fena değil. | — 어떻게 지내? — 나쁘지 않아.
çok iyi | 아주 좋아요 | phr | Türkçen çok iyi! | 너 튀르키예어 정말 잘한다!
hadi | 자, 어서 | int | Hadi gidelim! | 자, 가자!
`,

  people: `
insan | 사람, 인간 | n | O çok iyi bir insan. | 그는 정말 좋은 사람이에요.
kişi | 사람(셀 때), 명 | n | Kaç kişisiniz? — Dört kişiyiz. | 몇 분이세요? — 네 명이에요.
adam | 남자, 사람 | n | Kapıda bir adam var. | 문 앞에 어떤 남자가 있어요.
kadın | 여자, 여성 | n | Bu kadın bir doktor. | 이 여자분은 의사예요.
erkek | 남자, 남성 | n | Erkek kardeşim on yaşında. | 제 남동생은 열 살이에요.
kız | 여자아이, 딸 | n | Küçük kız çok tatlı. | 그 작은 여자아이는 정말 귀여워요.
çocuk | 아이 | n | Çocuklar parkta oynuyor. | 아이들이 공원에서 놀고 있어요.
bebek | 아기 | n | Bebek uyuyor. | 아기가 자고 있어요.
arkadaş | 친구 | n | O benim en iyi arkadaşım. | 그는 제 가장 친한 친구예요.
aile | 가족 | n | Ailem Seul'de yaşıyor. | 우리 가족은 서울에 살아요.
anne | 엄마, 어머니 | n | Annem çok güzel yemek yapar. | 우리 엄마는 요리를 정말 잘하세요.
baba | 아빠, 아버지 | n | Babam bir mühendis. | 우리 아빠는 엔지니어예요.
anneanne | 외할머니 | n | Anneannem İzmir'de oturuyor. | 외할머니는 이즈미르에 사세요. | | anne(엄마)+anne(엄마) = 엄마의 엄마. 한국어처럼 외가·친가를 구분해요!
babaanne | 친할머니 | n | Babaannem bize baklava yaptı. | 친할머니가 우리에게 바클라바를 만들어 주셨어요. | | baba(아빠)+anne(엄마) = 아빠의 엄마.
dede | 할아버지 | n | Dedem her sabah çay içer. | 할아버지는 매일 아침 차를 드세요.
kardeş | 형제자매, 동생 | n | İki kardeşim var. | 저는 형제가 둘 있어요. | | erkek kardeş(남동생·남자 형제), kız kardeş(여동생·여자 형제). 친한 친구를 부를 때도 써요.
abla | 언니, 누나 | n | Ablam üniversitede okuyor. | 우리 언니(누나)는 대학에 다녀요. | | 가게 점원 등 젊은 여성을 부를 때도 써요.
abi | 오빠, 형 | n | Abim futbol oynuyor. | 우리 오빠(형)는 축구를 해요. | alt=ağabey | 정식 표기는 ağabey. 젊은 남성 점원을 부를 때도 써요.
teyze | 이모 | n | Teyzem Ankara'da yaşıyor. | 이모는 앙카라에 사세요. | | 모르는 아주머니를 부를 때도 써요 — 한국어 '이모님'처럼!
hala | 고모 | n | Halam çok komik. | 고모는 정말 웃겨요.
dayı | 외삼촌 | n | Dayımın bir lokantası var. | 외삼촌은 식당을 하나 하세요.
amca | 삼촌(아빠의 형제), 아저씨 | n | Amca, durak nerede? | 아저씨, 정류장이 어디예요? | | 모르는 아저씨를 부를 때도 써요 — 한국어 '아저씨'처럼!
eş | 배우자 | n | Eşim Türk. | 제 배우자는 튀르키예 사람이에요.
koca | 남편 | n | Kocası doktor. | 그녀의 남편은 의사예요.
oğul | 아들 | n | Oğlum yedi yaşında. | 제 아들은 일곱 살이에요. | drop
torun | 손주 | n | Dedemin beş torunu var. | 할아버지에게는 손주가 다섯 명 있어요.
kuzen | 사촌 | n | Kuzenim Almanya'da yaşıyor. | 제 사촌은 독일에 살아요.
komşu | 이웃 | n | Komşumuz çok nazik. | 우리 이웃은 정말 친절해요.
sevgili | 애인 | n | Sevgilim Koreli. | 제 애인은 한국 사람이에요.
misafir | 손님 | n | Bu akşam misafirimiz var. | 오늘 저녁에 손님이 와요.
ad | 이름 | n | Adın ne? | 이름이 뭐야? | hard
isim | 이름 | n | İsminiz nedir? | 성함이 어떻게 되세요? | drop
soyadı | 성(姓) | n | Soyadınız ne? | 성이 뭐예요? | nodrill
yaş | 나이 | n | Kaç yaşındasın? | 몇 살이야?
bey | ~씨(남성 이름 뒤) | n | Ahmet Bey burada mı? | 아흐메트 씨 여기 계세요? | | 이름 뒤에 붙여요: Ahmet Bey. 한국어 '~님'처럼!
hanım | ~씨(여성 이름 뒤) | n | Ayşe Hanım, buyurun. | 아이셰 씨, 이쪽으로 오세요. | | 이름 뒤에 붙여요: Ayşe Hanım.
`,

  jobs: `
öğretmen | 선생님, 교사 | n | Ben Türkçe öğretmeniyim. | 저는 튀르키예어 선생님이에요.
öğrenci | 학생 | n | Ben üniversite öğrencisiyim. | 저는 대학생이에요.
doktor | 의사 | n | Doktor şimdi geliyor. | 의사 선생님이 지금 오고 계세요.
hemşire | 간호사 | n | Hemşire çok nazik. | 간호사가 아주 친절해요.
mühendis | 엔지니어 | n | Abim bilgisayar mühendisi. | 오빠(형)는 컴퓨터 엔지니어예요.
avukat | 변호사 | n | Avukat yarın geliyor. | 변호사가 내일 와요.
polis | 경찰 | n | Polis nerede? | 경찰은 어디 있어요?
aşçı | 요리사 | n | Bu lokantanın aşçısı çok iyi. | 이 식당 요리사는 솜씨가 정말 좋아요.
garson | 웨이터, 종업원 | n | Garson, hesap lütfen! | 여기요, 계산서 주세요!
şoför | 운전기사 | n | Taksi şoförü yolu biliyor. | 택시 기사가 길을 알아요.
satıcı | 판매원, 상인 | n | Satıcı bana indirim yaptı. | 상인이 저에게 할인해 줬어요.
işçi | 노동자 | n | İşçiler fabrikada çalışıyor. | 노동자들이 공장에서 일하고 있어요.
memur | 공무원 | n | Babam devlet memuru. | 아빠는 공무원이에요.
yazar | 작가 | n | Orhan Pamuk ünlü bir yazar. | 오르한 파묵은 유명한 작가예요.
şarkıcı | 가수 | n | Bu şarkıcı Kore'de çok ünlü. | 이 가수는 한국에서 아주 유명해요.
oyuncu | 배우, 선수 | n | O ünlü bir oyuncu. | 그는 유명한 배우예요.
ressam | 화가 | n | Ressam deniz resmi yapıyor. | 화가가 바다 그림을 그리고 있어요.
rehber | 가이드 | n | Rehberimiz İstanbul'u çok iyi biliyor. | 우리 가이드는 이스탄불을 아주 잘 알아요.
patron | 사장 | n | Patronum bugün izinli. | 우리 사장님은 오늘 휴가예요.
iş | 일, 직업, 직장 | n | Ne iş yapıyorsunuz? | 무슨 일을 하세요?
meslek | 직업 | n | Mesleğiniz ne? | 직업이 뭐예요?
emekli | 은퇴한 | adj | Dedem emekli. | 할아버지는 은퇴하셨어요.
usta | 기술자, 장인(기사님) | n | Usta, araba ne zaman hazır? | 기사님, 차 언제 다 돼요? | | 기술자·운전기사·요리사를 존중해서 부르는 말이에요.
hoca | 선생님(호칭) | n | Hocam, bir sorum var. | 선생님, 질문이 하나 있어요. | | 'Hocam(나의 선생님)'처럼 호칭으로 많이 써요.
`,

  countries: `
Kore | 한국 | n | Kore'den geliyorum. | 한국에서 왔어요. | proper
Güney Kore | 대한민국 | n | Güney Kore'nin başkenti Seul. | 대한민국의 수도는 서울이에요. | proper nodrill
Koreli | 한국인, 한국 출신 | n | Ben Koreliyim. | 저는 한국 사람이에요.
Korece | 한국어 | n | Korece biliyor musun? | 한국어 할 줄 알아?
Türkiye | 튀르키예 | n | Türkiye çok güzel bir ülke. | 튀르키예는 정말 아름다운 나라예요. | proper
Türk | 튀르키예 사람 | n | Arkadaşım Türk. | 제 친구는 튀르키예 사람이에요. | nodrill
Türkçe | 튀르키예어 | n | Türkçe öğreniyorum. | 튀르키예어를 배우고 있어요.
İngilizce | 영어 | n | İngilizce konuşuyor musunuz? | 영어 하세요?
Japonya | 일본 | n | Japonya Kore'ye çok yakın. | 일본은 한국과 아주 가까워요. | proper
Japonca | 일본어 | n | Japonca biraz biliyorum. | 일본어를 조금 알아요.
Çin | 중국 | n | Çin çok büyük bir ülke. | 중국은 아주 큰 나라예요. | proper
Çince | 중국어 | n | Çince zor mu? | 중국어 어려워요?
Amerika | 미국 | n | Kuzenim Amerika'da yaşıyor. | 제 사촌은 미국에 살아요. | proper
Almanya | 독일 | n | Almanya'da çok Türk var. | 독일에는 튀르키예 사람이 많아요. | proper
İngiltere | 영국 | n | İngiltere'de çok yağmur yağar. | 영국은 비가 많이 와요. | proper
Fransa | 프랑스 | n | Fransa'ya hiç gittin mi? | 프랑스에 가 본 적 있어? | proper
ülke | 나라 | n | Hangi ülkeden geliyorsunuz? | 어느 나라에서 오셨어요?
dil | 언어; 혀 | n | Türkçe kolay bir dil mi? | 튀르키예어는 쉬운 언어인가요?
yabancı | 외국인; 낯선 | n | Ben burada yabancıyım. | 저는 여기서 외국인이에요.
nereli | 어디 출신 | q | Nerelisin? | 어디 출신이야?
başkent | 수도 | n | Türkiye'nin başkenti Ankara. | 튀르키예의 수도는 앙카라예요.
İstanbul | 이스탄불 | n | İstanbul'da çok turist var. | 이스탄불에는 관광객이 많아요. | proper
Ankara | 앙카라 | n | Ankara'ya otobüsle gidiyoruz. | 우리는 앙카라에 버스로 가요. | proper
Seul | 서울 | n | Seul'de yaşıyorum. | 저는 서울에 살아요. | proper front
İstanbullu | 이스탄불 사람 | n | Ben İstanbulluyum. | 저는 이스탄불 사람이에요.
`,

  numbers: `
sıfır | 0, 영 | num | Sıfır derece, çok soğuk! | 0도라니, 너무 추워요!
bir | 1, 하나; 한(어떤) | num | Bir çay, lütfen. | 차 한 잔 주세요.
iki | 2, 둘 | num | İki kardeşim var. | 저는 형제가 둘 있어요.
üç | 3, 셋 | num | Üç gün İstanbul'da kaldım. | 이스탄불에서 사흘 머물렀어요. | hard
dört | 4, 넷 | num | Dört kişiyiz. | 우리는 네 명이에요. | soft
beş | 5, 다섯 | num | Saat beşte buluşalım. | 5시에 만나요.
altı | 6, 여섯 | num | Altı yaşında bir oğlum var. | 여섯 살 아들이 하나 있어요.
yedi | 7, 일곱 | num | Haftada yedi gün var. | 일주일은 7일이에요.
sekiz | 8, 여덟 | num | Sekiz saat uyudum. | 여덟 시간 잤어요.
dokuz | 9, 아홉 | num | Ders dokuzda başlıyor. | 수업은 9시에 시작해요.
on | 10, 열 | num | On dakika bekleyin, lütfen. | 10분만 기다려 주세요.
yirmi | 20, 스물 | num | Yirmi yaşındayım. | 저는 스무 살이에요.
otuz | 30, 서른 | num | Bilet otuz lira. | 표는 30리라예요.
kırk | 40, 마흔 | num | Kırk dakika yürüdük. | 우리는 40분 걸었어요.
elli | 50, 쉰 | num | Elli lira yeterli mi? | 50리라면 충분해요?
altmış | 60, 예순 | num | Bir saat altmış dakika. | 한 시간은 60분이에요.
yetmiş | 70, 일흔 | num | Dedem yetmiş yaşında. | 할아버지는 일흔 살이세요.
seksen | 80, 여든 | num | Babaannem seksen yaşında. | 친할머니는 여든 살이세요.
doksan | 90, 아흔 | num | Bu yolculuk doksan dakika sürüyor. | 이 여정은 90분 걸려요.
yüz | 100, 백 | num | Bu ayakkabı yüz lira. | 이 신발은 100리라예요. | id=yuz_100 | '얼굴'도 yüz예요. 100은 '한 백'이 아니라 그냥 yüz!
bin | 1000, 천 | num | Bin lira çok para! | 천 리라는 큰돈이에요! | | 1000도 '일천'이 아니라 그냥 bin — 한국어 '천'과 같아요.
milyon | 백만 | num | İstanbul'da on beş milyon insan yaşıyor. | 이스탄불에는 1,500만 명이 살아요.
milyar | 10억 | num | Dünyada sekiz milyar insan var. | 세계 인구는 80억 명이에요.
yarım | 반, 절반 | num | Yarım kilo peynir, lütfen. | 치즈 반 킬로 주세요.
buçuk | ~반(수 뒤에서) | num | Saat iki buçuk. | 2시 반이에요.
çeyrek | 4분의 1, 15분 | num | Saat üçü çeyrek geçiyor. | 3시 15분이에요.
birinci | 첫 번째 | num | Birinci sınıftayım. | 저는 1학년이에요.
ikinci | 두 번째 | num | İkinci sokaktan sağa dönün. | 두 번째 골목에서 오른쪽으로 도세요.
son | 마지막 | adj | Son otobüs saat kaçta? | 막차는 몇 시예요?
kaç | 몇, 얼마 | q | Kaç yaşındasın? | 몇 살이야?
sayı | 숫자 | n | Bu sayı çok büyük. | 이 숫자는 아주 커요.
tane | 개(수량 단위) | n | İki tane simit, lütfen. | 시미트 두 개 주세요.
kilo | 킬로그램 | n | Bir kilo elma, lütfen. | 사과 1킬로 주세요.
`,

  time: `
zaman | 시간, 때 | n | Hiç zamanım yok. | 시간이 전혀 없어요.
saat | 시, 시계, 시간 | n | Saat kaç? | 몇 시예요? | front hard | 앞모음 예외: saati, saatte, saate
dakika | 분 | n | Beş dakika sonra geliyorum. | 5분 후에 갈게요.
saniye | 초 | n | Bir saniye, lütfen! | 잠깐만요!
gün | 날, 일 | n | Bugün güzel bir gün. | 오늘은 좋은 날이에요.
hafta | 주, 일주일 | n | Gelecek hafta Antalya'ya gidiyoruz. | 다음 주에 안탈리아에 가요.
ay | 달, 월 | n | Bir ay Türkiye'de kalacağım. | 한 달 동안 튀르키예에 있을 거예요. | | 하늘의 '달'도 ay예요.
yıl | 해, 년 | n | Bu yıl Türkçe öğreniyorum. | 올해 튀르키예어를 배우고 있어요.
sene | 해, 년 | n | Geçen sene Kapadokya'ya gittim. | 작년에 카파도키아에 갔어요.
bugün | 오늘 | adv | Bugün hava çok güzel. | 오늘 날씨가 정말 좋아요.
yarın | 내일 | adv | Yarın görüşürüz! | 내일 봐요!
dün | 어제 | adv | Dün çok yoruldum. | 어제 정말 피곤했어요.
şimdi | 지금 | adv | Şimdi neredesin? | 지금 어디야?
sabah | 아침 | n | Sabah yedide kalkarım. | 아침 7시에 일어나요.
öğle | 정오, 점심때 | n | Öğle yemeği saat birde. | 점심은 1시예요.
öğleden sonra | 오후 | adv | Öğleden sonra müzeye gidiyoruz. | 오후에 박물관에 가요.
akşam | 저녁 | n | Akşam ne yapıyorsun? | 저녁에 뭐 해?
gece | 밤 | n | Gece geç uyudum. | 밤에 늦게 잤어요.
pazartesi | 월요일 | n | Pazartesi işe gidiyorum. | 월요일에 출근해요. | | 요일·달 이름은 특정 날짜를 말할 때 대문자로 써요: 5 Ekim Pazartesi
salı | 화요일 | n | Salı günü dersim var. | 화요일에 수업이 있어요.
çarşamba | 수요일 | n | Çarşamba akşamı boşum. | 수요일 저녁에 한가해요.
perşembe | 목요일 | n | Perşembe günü pazar kuruluyor. | 목요일에 장이 서요.
cuma | 금요일 | n | Cuma akşamı sinemaya gidelim. | 금요일 저녁에 영화 보러 가자.
cumartesi | 토요일 | n | Cumartesi geç kalkarım. | 토요일엔 늦게 일어나요.
pazar | 일요일; 시장 | n | Pazar günü ailemle kahvaltı yaparım. | 일요일엔 가족과 아침을 먹어요. | | '시장'이라는 뜻도 있어요: pazara gitmek(시장에 가다)
ocak | 1월 | n | Ocakta çok kar yağar. | 1월엔 눈이 많이 와요.
şubat | 2월 | n | Şubat kısa bir ay. | 2월은 짧은 달이에요.
mart | 3월 | n | Martta bahar geliyor. | 3월에 봄이 와요.
nisan | 4월 | n | Nisanda İstanbul'da lale festivali var. | 4월에 이스탄불에서 튤립 축제가 열려요.
mayıs | 5월 | n | Doğum günüm mayısta. | 제 생일은 5월이에요.
haziran | 6월 | n | Okullar haziranda kapanıyor. | 학교는 6월에 방학해요.
temmuz | 7월 | n | Temmuzda hava çok sıcak. | 7월엔 날씨가 아주 더워요.
ağustos | 8월 | n | Ağustosta tatile gidiyoruz. | 8월에 휴가를 가요.
eylül | 9월 | n | Okullar eylülde açılıyor. | 학교는 9월에 개학해요.
ekim | 10월 | n | Ekimde hava serin. | 10월엔 날씨가 선선해요.
kasım | 11월 | n | Kasımda çok yağmur yağar. | 11월엔 비가 많이 와요.
aralık | 12월 | n | Aralık yılın son ayı. | 12월은 한 해의 마지막 달이에요.
mevsim | 계절 | n | En sevdiğin mevsim hangisi? | 가장 좋아하는 계절이 뭐야?
ilkbahar | 봄 | n | İlkbaharda çiçekler açar. | 봄에는 꽃이 펴요.
yaz | 여름 | n | Yazın denize gideriz. | 여름엔 바다에 가요.
sonbahar | 가을 | n | Sonbaharda yapraklar sararır. | 가을엔 잎이 노랗게 물들어요.
kış | 겨울 | n | Kışın çok kar yağar. | 겨울엔 눈이 많이 와요.
hafta sonu | 주말 | n | Hafta sonu ne yapıyorsun? | 주말에 뭐 해?
tatil | 휴가, 방학 | n | Tatilde Antalya'ya gidiyoruz. | 휴가 때 안탈리아에 가요.
doğum günü | 생일 | n | Doğum günün kutlu olsun! | 생일 축하해!
bayram | 명절, 축제일 | n | Bayramda ailemi ziyaret ederim. | 명절에는 가족을 찾아가요. | | 한국의 설·추석처럼 가족이 모이는 날이에요.
yılbaşı | 새해 첫날, 연말연시 | n | Yılbaşında ne yapıyorsun? | 새해 첫날에 뭐 해?
erken | 일찍 | adv | Sabah erken kalkıyorum. | 아침에 일찍 일어나요.
geç | 늦게 | adv | Geç kaldım, özür dilerim! | 늦었어요, 죄송해요!
önce | 전에, 먼저 | adv | Yemekten önce ellerini yıka. | 식사 전에 손을 씻어.
sonra | 후에, 나중에 | adv | Dersten sonra kahve içelim. | 수업 끝나고 커피 마시자.
`,
};
