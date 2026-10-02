// 6~10단원: 현재진행 · 시간 · 이동 · 과거 · 소유
const b = (s) => `<b class="tr">${s}</b>`;

export const UNITS2 = [
  {
    id: 'u6', no: 6, title: '지금 뭐 해요?', tr: 'Ne yapıyorsun?', color: '#15a34a', notes: ['prog'],
    desc: '동사 원형 -mek, 현재진행 -iyor, 부정·질문, 하루 일과',
    lessons: [
      {
        id: 'u6l1', title: '동사 기초', tr: 'Gelmek, gitmek', notes: ['prog'],
        words: ['gelmek', 'gitmek', 'yapmak', 'yemek_v', 'icmek', 'okumak', 'yazmak', 'konusmak'],
        tip: {
          title: '-mek = "-다"',
          html: `튀르키예어 동사의 기본형은 <b>-mek/-mak</b>으로 끝나요. 한국어 '-다'와 같은 역할이죠: ${b('gel-mek')} 오-다, ${b('git-mek')} 가-다.<br><br>활용할 땐 -mek/-mak을 떼고 남은 <b>어간</b>에 어미를 붙여요. 한국어 '먹-다 → 먹-고 있다'와 똑같은 방식이에요.<br>${b('gel')} + iyor + um → ${b('geliyorum')} 오-고 있-어요(나)`,
        },
        items: [
          { q: '"오다(gelmek)"의 어간은?', opts: ['gel', 'gelme', 'mek'], a: 0, why: 'gelmek에서 -mek을 뗀 gel이 어간이에요.' },
          { q: '"읽다(okumak)"의 어간은?', opts: ['oku', 'okum', 'okuma'], a: 0, why: 'okumak - mak = oku' },
          { q: '동사 원형을 만드는 어미는?', opts: ['-mek / -mak', '-yor', '-lar / -ler'], a: 0, why: '-mek/-mak = 한국어 "-다"' },
        ],
        sents: [
          ['Ne yapıyorsun?', '뭐 하고 있어?'],
          ['Kitap okuyorum.', '책을 읽고 있어요.'],
          ['Çay içiyorum.', '차를 마시고 있어요.'],
          ['Ali geliyor.', '알리가 오고 있어요.'],
          ['Okula gidiyorum.', '학교에 가고 있어요.'],
          ['Türkçe konuşuyorum.', '튀르키예어로 말하고 있어요.'],
        ],
      },
      {
        id: 'u6l2', title: '-iyor 활용', tr: 'Geliyorum', notes: ['prog', 'harmony'],
        words: ['calismak', 'ogrenmek', 'beklemek', 'oturmak', 'uyumak', 'bakmak', 'dinlemek', 'izlemek'],
        tip: {
          title: '어간 + (ı/i/u/ü) + yor + 인칭',
          html: `현재진행은 어간에 <b>4형 모음 + yor</b>를 붙이고, 끝에 인칭을 달아요.<br>${b('çalış-ıyor-um')} 일하고 있어요 · ${b('otur-uyor-uz')} 우리는 앉아 있어요<br><br>인칭어미: <b>-um, -sun, –, -uz, -sunuz, -lar</b> (yor의 o 때문에 늘 u!)<br>어간이 a/e로 끝나면 그 모음이 바뀌어요: ${b('bekle → bekliyor')}, ${b('başla → başlıyor')}<br>어간이 ı/i/u/ü로 끝나면 yor만: ${b('uyu → uyuyor')}`,
        },
        items: [
          { q: 'çalış + -iyor + (나)', opts: ['çalışıyorum', 'çalışiyorum', 'çalışuyorum'], a: 0, why: '마지막 모음 ı → ı: çalış-ıyor-um' },
          { q: 'bekle + -iyor + (너)', opts: ['bekliyorsun', 'bekleyorsun', 'bekleiyorsun'], a: 0, why: '어간 끝 e가 i로: bekl-iyor-sun' },
          { q: 'otur + -iyor + (우리)', opts: ['oturuyoruz', 'oturiyoruz', 'oturıyoruz'], a: 0, why: '마지막 모음 u → u: otur-uyor-uz' },
          { q: 'uyu + -iyor + (그)', opts: ['uyuyor', 'uyuiyor', 'uyıyor'], a: 0, why: '모음으로 끝나는 어간은 yor만: uyu-yor' },
        ],
        sents: [
          ['Bir bankada çalışıyorum.', '은행에서 일하고 있어요.'],
          ['Türkçe öğreniyoruz.', '우리는 튀르키예어를 배우고 있어요.'],
          ['Seni bekliyorum.', '너를 기다리고 있어.'],
          ['Bebek uyuyor.', '아기가 자고 있어요.'],
          ['Müzik dinliyorlar.', '그들은 음악을 듣고 있어요.'],
          ['Akşam film izliyoruz.', '저녁에 영화를 봐요.'],
        ],
      },
      {
        id: 'u6l3', title: '부정과 질문', tr: 'Bilmiyorum', notes: ['prog', 'question'],
        words: ['anlamak', 'bilmek', 'sevmek', 'dusunmek', 'hatirlamak', 'aramak', 'bulmak', 'duymak'],
        tip: {
          title: '"-지 않다"는 -mi-, 질문은 mi',
          html: `부정은 어간 바로 뒤에 <b>-mi-</b>(4형): ${b('gel-mi-yor-um')} 안 와요 · ${b('anla-mı-yor-um')} 이해 못 해요<br><br>질문은 mi를 띄어 쓰고, <b>인칭어미가 mi 뒤로</b> 가요:<br>${b('Geliyor musun?')} 와? · ${b('Biliyor musunuz?')} 아세요?<br><br>한국어 '-니?'를 붙이는 느낌이지만 위치가 살짝 달라요.`,
        },
        items: [
          { q: '"이해 못 해요"', opts: ['Anlamıyorum.', 'Anlamayorum.', 'Anlamiyorum.'], a: 0, why: 'anla + mı + yor + um — 부정 -mı-도 모음조화를 따라요.' },
          { q: 'Biliyor ___? (너 알아?)', opts: ['musun', 'mısın', 'misin'], a: 0, why: 'biliyor의 마지막 모음 o → mu + sun' },
          { q: '"(너) 좋아해?"', opts: ['Seviyor musun?', 'Seviyorsun mu?', 'Sev musun?'], a: 0, why: '인칭어미(sun)는 mi 뒤로 가요.' },
        ],
        sents: [
          ['Anlamıyorum.', '이해가 안 돼요.'],
          ['Bilmiyorum.', '몰라요.'],
          ['Türkçe biliyor musun?', '튀르키예어 할 줄 알아?'],
          ['Kahve sevmiyorum.', '커피를 안 좋아해요.'],
          ['Beni duyuyor musun?', '내 말 들려?'],
          ['Ne düşünüyorsun?', '무슨 생각 해?'],
          ['Adını hatırlamıyorum.', '이름이 기억 안 나요.'],
        ],
      },
      {
        id: 'u6l4', title: '하루 일과', tr: 'Her gün',
        words: ['kalkmak', 'uyanmak', 'kahvalti_etmek', 'yatmak', 'her_gun', 'sabah', 'aksam', 'simdi'],
        tip: {
          title: '-iyor는 "요즘·습관"에도',
          html: `-iyor는 지금 하는 일뿐 아니라 요즘의 일, 가까운 계획에도 써요. 한국어 '-어요'처럼 넓게 쓰여요.<br>${b('Her gün yürüyorum.')} 매일 걸어요 · ${b('Yarın geliyorum.')} 내일 와요<br><br>${b('kahvaltı etmek')}(아침 먹다)처럼 <b>명사 + etmek</b>은 한국어 '명사 + 하다'와 같아요. et은 모음 앞에서 ed가 돼요: ${b('kahvaltı ediyorum')}`,
        },
        items: [
          { q: '"매일 아침 7시에 일어나요"', opts: ['Her sabah yedide kalkıyorum.', 'Her sabah yedide kalkıyor.', 'Kalkıyorum her sabah yedi.'], a: 0, why: '동사는 끝에, 나(ben)는 -um으로.' },
          { q: 'kahvaltı et + -iyor + (나)', opts: ['kahvaltı ediyorum', 'kahvaltı etiyorum', 'kahvaltı edeyorum'], a: 0, why: 'et → ed (모음 앞에서 t→d)' },
        ],
        sents: [
          ['Her sabah yedide kalkıyorum.', '매일 아침 7시에 일어나요.'],
          ['Sabah kahvaltı ediyorum.', '아침에 아침밥을 먹어요.'],
          ['Şimdi işe gidiyorum.', '지금 출근하고 있어요.'],
          ['Akşam eve dönüyorum.', '저녁에 집에 돌아가요.'],
          ['Gece on birde yatıyorum.', '밤 11시에 자요.'],
          ['Hafta sonu geç uyanıyorum.', '주말엔 늦게 일어나요.'],
        ],
      },
    ],
  },
  {
    id: 'u7', no: 7, title: '시간과 날짜', tr: 'Zaman', color: '#0891b2', notes: ['time'],
    desc: '요일, 달, 계절·날씨, 몇 시예요?',
    lessons: [
      {
        id: 'u7l1', title: '요일', tr: 'Bugün günlerden ne?', notes: ['time'],
        words: ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar', 'bugun', 'yarin', 'dun'],
        tip: {
          title: '오늘 무슨 요일이야?',
          html: `${b('Bugün günlerden ne?')} — 직역하면 "오늘은 날들 중 무엇?"<br>"~요일에"는 요일 + ${b('günü')}: ${b('pazartesi günü')} 월요일에<br><br>💡 ${b('cuma')}(금요일)는 '모이는 날'(금요 예배)에서, ${b('pazar')}(일요일)는 '시장'에서 왔어요 — 일요일에 장이 섰거든요!`,
        },
        items: [
          { q: '"월요일 다음 날"은?', opts: ['salı', 'çarşamba', 'pazar'], a: 0, why: 'pazartesi(월) → salı(화)' },
          { q: '"내일은 토요일이야"', opts: ['Yarın cumartesi.', 'Dün cumartesi.', 'Bugün cumartesi.'], a: 0, why: 'yarın = 내일, dün = 어제, bugün = 오늘' },
        ],
        sents: [
          ['Bugün günlerden ne?', '오늘 무슨 요일이야?'],
          ['Bugün cuma.', '오늘은 금요일이에요.'],
          ['Yarın cumartesi.', '내일은 토요일이에요.'],
          ['Dün pazardı.', '어제는 일요일이었어요.'],
          ['Pazartesi günü işe gidiyorum.', '월요일에 출근해요.'],
          ['Salı günü dersim var.', '화요일에 수업이 있어요.'],
        ],
      },
      {
        id: 'u7l2', title: '열두 달', tr: 'Aylar',
        words: ['ocak', 'subat', 'mart', 'nisan', 'mayis', 'haziran', 'temmuz', 'agustos', 'eylul', 'ekim', 'kasim', 'aralik'],
        tip: {
          title: '날짜는 "일 + 월" 순서',
          html: `한국처럼 '1월, 2월'이 아니라 달마다 이름이 있어요. 하지만 날짜는 <b>일 → 월 → 년</b> 순서예요: ${b('2 Ekim 2026')} = 2026년 10월 2일 (한국어와 반대!)<br><br>"~월에"는 장소격: ${b('mayısta')} 5월에, ${b('eylülde')} 9월에`,
        },
        items: [
          { q: '"10월 2일"', opts: ['2 Ekim', 'Ekim 2', 'İkinci Ekim'], a: 0, why: '일 + 월 순서예요.' },
          { q: '"7월에"', opts: ['temmuzda', 'temmuzde', 'temmuzta'], a: 0, why: '마지막 모음 u → -da, z는 유성음 → d' },
        ],
        sents: [
          ['Doğum günüm mayısta.', '제 생일은 5월이에요.'],
          ['Ağustosta tatile gidiyoruz.', '8월에 휴가를 가요.'],
          ['Bugün 2 Ekim.', '오늘은 10월 2일이에요.'],
          ['Okullar eylülde açılıyor.', '학교는 9월에 개학해요.'],
          ['Ocakta çok kar yağar.', '1월엔 눈이 많이 와요.'],
          ['Aralık yılın son ayı.', '12월은 한 해의 마지막 달이에요.'],
        ],
      },
      {
        id: 'u7l3', title: '계절과 날씨', tr: 'Hava nasıl?',
        words: ['mevsim', 'ilkbahar', 'yaz', 'sonbahar', 'kis', 'hava', 'serin', 'yagmur', 'kar', 'gunesli'],
        tip: {
          title: '날씨 묻고 답하기',
          html: `${b('Hava nasıl?')} 날씨 어때? (hava = 날씨, 공기)<br>비·눈이 오다 = ${b('yağmur yağıyor')} / ${b('kar yağıyor')} — '비가 내린다'처럼 yağmak(내리다)를 써요.<br><br>계절 + -ın = "~에": ${b('yazın')} 여름에, ${b('kışın')} 겨울에`,
        },
        items: [
          { q: '"비가 와요"', opts: ['Yağmur yağıyor.', 'Yağmur geliyor.', 'Yağmur var yağ.'], a: 0, why: 'yağmur(비) + yağıyor(내리고 있다)' },
          { q: '"겨울에"', opts: ['kışın', 'kışta', 'kışa'], a: 0, why: '계절 이름 + -ın = ~에 (yazın, kışın)' },
        ],
        sents: [
          ['Bugün hava nasıl?', '오늘 날씨 어때요?'],
          ['Hava çok güzel, güneşli.', '날씨가 아주 좋아요, 맑아요.'],
          ['Yağmur yağıyor.', '비가 와요.'],
          ['Kışın çok kar yağar.', '겨울엔 눈이 많이 와요.'],
          ['En sevdiğim mevsim sonbahar.', '제가 가장 좋아하는 계절은 가을이에요.'],
          ['Akşamları hava serin.', '저녁엔 날씨가 선선해요.'],
        ],
      },
      {
        id: 'u7l4', title: '몇 시예요?', tr: 'Saat kaç?', notes: ['time'],
        words: ['saat', 'dakika', 'bucuk', 'ceyrek', 'erken', 'gec', 'once', 'sonra'],
        tip: {
          title: '시각 말하기',
          html: `${b('Saat kaç?')} 몇 시예요? → ${b('Saat üç.')} 3시 / ${b('Saat üç buçuk.')} 3시 반<br>'3시 15분' = ${b('Saat üçü çeyrek geçiyor.')} (3을 15분 지나고 있다)<br>'3시 45분' = ${b('Saat dörde çeyrek var.')} (4에 15분 남았다)<br><br>"몇 시에?" = ${b('Saat kaçta?')} → ${b('Saat üçte.')} 3시에 (장소격!)`,
        },
        items: [
          { q: '3:30', opts: ['Saat üç buçuk.', 'Saat üç yarım.', 'Saat buçuk üç.'], a: 0, why: '"~시 반" = 시 + buçuk' },
          { q: '"몇 시에 만날까?"', opts: ['Saat kaçta buluşalım?', 'Saat kaç buluşalım?', 'Saat kaça buluşalım?'], a: 0, why: '"몇 시에" = kaç + ta (장소격)' },
          { q: '"5시에"', opts: ['saat beşte', 'saat beşe', 'saat beşi'], a: 0, why: 'beş + te: ş는 무성음 → t' },
        ],
        sents: [
          ['Saat kaç?', '몇 시예요?'],
          ['Saat üç buçuk.', '3시 반이에요.'],
          ['Saat kaçta buluşalım?', '몇 시에 만날까?'],
          ['Saat beşte buluşalım.', '5시에 만나자.'],
          ['Ders saat dokuzda başlıyor.', '수업은 9시에 시작해요.'],
          ['Beş dakika sonra geliyorum.', '5분 후에 갈게요.'],
          ['Geç kaldım, özür dilerim!', '늦었어요, 죄송해요!'],
        ],
      },
    ],
  },
  {
    id: 'u8', no: 8, title: '이동과 여행', tr: 'Yolculuk', color: '#c2410c', notes: ['dative', 'ablative', 'instrumental', 'cases'],
    desc: '~에/~로(-a), ~에서/~부터(-dan), 교통수단(-la), 길 묻기',
    lessons: [
      {
        id: 'u8l1', title: '어디에 가요? (-a)', tr: 'Okula gidiyorum', notes: ['dative', 'buffer'],
        words: ['banka', 'market', 'hastane', 'eczane', 'muze', 'park', 'sinema', 'havalimani'],
        tip: {
          title: '방향 "~에, ~로" = -(y)a / -(y)e',
          html: `${b('okul-a gidiyorum')} 학교에 가요 · ${b('ev-e dönüyorum')} 집에 돌아가요<br>모음 뒤에는 y를 넣어요: ${b('banka-y-a')}, ${b('müze-y-e')}<br><br>💡 한국어는 자음 뒤에 '으'를 넣죠(집<b>으</b>로 / 학교로). 튀르키예어는 반대로 <b>모음 뒤에 y</b>를 넣어요!<br>연음도 주의: ${b('kitap → kitaba')}`,
        },
        items: [
          { q: 'banka + 에(방향)', opts: ['bankaya', 'bankae', 'bankada'], a: 0, why: '모음으로 끝나서 y + a' },
          { q: 'park + 에(방향)', opts: ['parka', 'parke', 'parkya'], a: 0, why: '마지막 모음 a → -a (park는 한 음절이라 연음 없음)' },
          { q: 'müze + 에(방향)', opts: ['müzeye', 'müzee', 'müzeya'], a: 0, why: '모음 끝 → y, 마지막 모음 e → -e' },
          { q: 'kitap + 에(방향)', opts: ['kitaba', 'kitapa', 'kitapya'], a: 0, why: '모음 어미 앞에서 p → b' },
        ],
        sents: [
          ['Bankaya gidiyorum.', '은행에 가요.'],
          ['Markete gidiyorum, bir şey ister misin?', '마트 가는데, 뭐 필요해?'],
          ['Müzeye nasıl gidebilirim?', '박물관에 어떻게 가요?'],
          ['Havalimanına taksiyle gidiyoruz.', '공항에 택시로 가요.'],
          ['Sinemaya gidelim mi?', '영화관에 갈까?'],
          ['Hastaneye gitmem lazım.', '병원에 가야 해요.'],
        ],
      },
      {
        id: 'u8l2', title: '어디에서? (-dan)', tr: "Kore'den geliyorum", notes: ['ablative'],
        words: ['nereden', 'nereye', 'uzak', 'yakin', 'kadar', 'sehir', 'koy', 'sokak'],
        tip: {
          title: '출발 "~에서, ~부터" = -dan / -den',
          html: `${b("Kore'den geliyorum.")} 한국에서 왔어요<br>무성음 뒤엔 -tan/-ten: ${b('sokak-tan')}<br><br>"~에서 ~까지" = ${b('-dan … -a kadar')}<br>${b("Seul'den Busan'a kadar")} 서울에서 부산까지 — 한국어와 순서까지 똑같아요!`,
        },
        items: [
          { q: 'Kore + 에서', opts: ["Kore'den", "Kore'dan", 'Koreden'], a: 0, why: '마지막 모음 e → -den, 고유명사는 아포스트로피' },
          { q: 'sokak + 에서', opts: ['sokaktan', 'sokakdan', 'sokaktın'], a: 0, why: 'k는 무성음 → -tan' },
          { q: '"서울에서 부산까지"', opts: ["Seul'den Busan'a kadar", "Seul'e Busan'dan kadar", "Seul'de Busan'da kadar"], a: 0, why: '-den(에서) … -a kadar(까지)' },
        ],
        sents: [
          ["Kore'den geliyorum.", '한국에서 왔어요.'],
          ['Nereden geliyorsunuz?', '어디서 오셨어요?'],
          ['Nereye gidiyorsun?', '어디 가?'],
          ['Otel buradan uzak mı?', '호텔이 여기서 멀어요?'],
          ['Hayır, çok yakın.', '아니요, 아주 가까워요.'],
          ['Sabahtan akşama kadar çalışıyorum.', '아침부터 저녁까지 일해요.'],
        ],
      },
      {
        id: 'u8l3', title: '교통수단 (-la)', tr: 'Otobüsle', notes: ['instrumental'],
        words: ['otobus', 'metro', 'tramvay', 'taksi', 'vapur', 'ucak', 'tren', 'bilet'],
        tip: {
          title: '"~로(수단)" = -(y)la / -(y)le',
          html: `${b('otobüs-le')} 버스로 · ${b('taksi-y-le')} 택시로 · ${b('uçak-la')} 비행기로<br><br>타다 = ${b('-e binmek')} (버스<b>에</b> 타다), 내리다 = ${b('-den inmek')} (버스<b>에서</b> 내리다) — 조사까지 한국어와 같아요!`,
        },
        items: [
          { q: 'taksi + 로(수단)', opts: ['taksiyle', 'taksile', 'taksiyla'], a: 0, why: '모음 끝 → y, 마지막 모음 i → -le' },
          { q: '"버스에 타요"', opts: ['Otobüse biniyorum.', 'Otobüsü biniyorum.', 'Otobüste biniyorum.'], a: 0, why: 'binmek는 여격 -e와 함께' },
          { q: '"지하철에서 내려요"', opts: ['Metrodan iniyorum.', 'Metroya iniyorum.', 'Metroda iniyorum.'], a: 0, why: 'inmek는 탈격 -dan과 함께' },
        ],
        sents: [
          ['Otobüsle mi gidiyoruz?', '버스로 가요?'],
          ['Hayır, metroyla gidiyoruz.', '아니요, 지하철로 가요.'],
          ['Vapura biniyoruz.', '페리에 타요.'],
          ['Gelecek durakta iniyorum.', '다음 정류장에서 내려요.'],
          ['İki bilet, lütfen.', '표 두 장 주세요.'],
          ["Uçakla Antalya'ya gidiyoruz.", '비행기로 안탈리아에 가요.'],
        ],
      },
      {
        id: 'u8l4', title: '길 묻기', tr: 'Nasıl gidebilirim?',
        words: ['sag', 'sol', 'duz', 'kose', 'yol', 'durak', 'istasyon', 'harita'],
        tip: {
          title: '길 묻기 공식',
          html: `${b('Affedersiniz, … nerede?')} 실례합니다, …이 어디예요?<br>${b('… nasıl gidebilirim?')} …에 어떻게 가요?<br><br>대답: ${b('Düz gidin')} 쭉 가세요 · ${b('Sağa dönün')} 오른쪽으로 도세요 · ${b('Sola dönün')} 왼쪽으로 · ${b('köşede')} 모퉁이에<br>-in/-ın은 존댓말 명령(~하세요)이에요: gidin, dönün.`,
        },
        items: [
          { q: '"오른쪽으로 도세요"', opts: ['Sağa dönün.', 'Sağda dönün.', 'Sağı dönün.'], a: 0, why: '방향은 여격: sağ + a' },
          { q: '"쭉 가세요"', opts: ['Düz gidin.', 'Düz gelin.', 'Düze gidin.'], a: 0, why: 'düz(곧장) + gidin(가세요)' },
        ],
        sents: [
          ['Affedersiniz, metro istasyonu nerede?', '실례합니다, 지하철역이 어디예요?'],
          ['Düz gidin, sonra sağa dönün.', '쭉 가다가 오른쪽으로 도세요.'],
          ['Eczane köşede.', '약국은 모퉁이에 있어요.'],
          ['Otobüs durağı solda.', '버스 정류장은 왼쪽에 있어요.'],
          ['Haritada gösterebilir misiniz?', '지도에서 보여 주실 수 있어요?'],
          ["Bu yol Taksim'e gidiyor mu?", '이 길로 탁심에 가요?'],
        ],
      },
    ],
  },
  {
    id: 'u9', no: 9, title: '어제 뭐 했어요?', tr: 'Dün ne yaptın?', color: '#4f46e5', notes: ['past'],
    desc: '과거 -dı, 부정·질문, 과거 시간 표현, 여행 이야기',
    lessons: [
      {
        id: 'u9l1', title: '과거 -dı', tr: 'Geldim', notes: ['past', 'consonants'],
        words: ['almak', 'vermek', 'gormek', 'satmak', 'acmak', 'kapatmak', 'baslamak', 'bitmek'],
        tip: {
          title: '"-았/었다" = -dı',
          html: `어간 + <b>dı</b>(4형) + 짧은 인칭어미: ${b('gel-di-m')} 왔어요 · ${b('al-dı-n')} 샀어<br>무성음 뒤에는 t: ${b('yap-tı-m')}, ${b('iç-ti-k')}, ${b('aç-tı')}<br><br>인칭어미: <b>-m, -n, –, -k, -nız, -lar</b><br>${b('geldim, geldin, geldi, geldik, geldiniz, geldiler')}`,
        },
        items: [
          { q: 'al + -dı + (나)', opts: ['aldım', 'aldim', 'altım'], a: 0, why: 'l은 유성음 → d, 마지막 모음 a → ı' },
          { q: 'aç + -dı + (우리)', opts: ['açtık', 'açdık', 'açtıq'], a: 0, why: 'ç는 무성음 → t, 우리 = -k' },
          { q: 'gör + -dı + (너)', opts: ['gördün', 'gördin', 'görtün'], a: 0, why: 'ö → ü, 너 = -n' },
        ],
        sents: [
          ['Dün yeni bir telefon aldım.', '어제 새 휴대폰을 샀어요.'],
          ['Dükkanı saat dokuzda açtık.', '가게를 9시에 열었어요.'],
          ['Seni dün gördüm.', '어제 너를 봤어.'],
          ['Film başladı!', '영화 시작했어!'],
          ['Ders bitti.', '수업이 끝났어요.'],
          ['Arabasını sattı.', '그는 차를 팔았어요.'],
        ],
      },
      {
        id: 'u9l2', title: '부정과 질문', tr: 'Gördün mü?', notes: ['past', 'question'],
        words: ['unutmak', 'kaybetmek', 'kazanmak', 'harcamak', 'odemek', 'sormak', 'cevap_vermek', 'karar_vermek'],
        tip: {
          title: '과거의 부정·질문',
          html: `부정: ${b('gel-me-di-m')} 안 왔어요 · ${b('unut-ma-dı-m')} 안 잊었어요<br>질문: ${b('Geldin mi?')} 왔어? — 과거는 <b>인칭어미 뒤에 mi</b>가 와요 (현재진행 Geliyor musun?과 반대!)`,
        },
        items: [
          { q: '"잊지 않았어요"', opts: ['Unutmadım.', 'Unutmıdım.', 'Unuttum değil.'], a: 0, why: 'unut + ma + dı + m' },
          { q: '"(너) 이겼어?"', opts: ['Kazandın mı?', 'Kazandı mısın?', 'Kazandın mi?'], a: 0, why: '과거는 kazandın + mı (인칭 뒤에 mı)' },
        ],
        sents: [
          ['Şifremi unuttum.', '비밀번호를 잊어버렸어요.'],
          ['Cüzdanımı kaybettim!', '지갑을 잃어버렸어요!'],
          ['Takımımız kazandı mı?', '우리 팀이 이겼어?'],
          ['Hesabı ödedin mi?', '계산했어?'],
          ['Henüz karar vermedim.', '아직 결정 못 했어요.'],
          ['Çok para harcamadık.', '돈을 많이 쓰지 않았어요.'],
        ],
      },
      {
        id: 'u9l3', title: '언제였어요?', tr: 'Geçen hafta', notes: ['past', 'copula'],
        words: ['gecen', 'hafta', 'ay', 'yil', 'sene', 'ne_zaman', 'tatil', 'seyahat'],
        tip: {
          title: '"지난 ~", "~ 전에", "~이었다"',
          html: `${b('geçen hafta')} 지난주 · ${b('geçen yıl')} 작년<br>${b('iki gün önce')} 이틀 전에 — 한국어 '이틀 전에'와 순서가 같아요!<br><br>명사·형용사의 과거 "~이었다"는 -dı를 그대로: ${b('Hava güzeldi.')} 날씨가 좋았어요 · ${b('Evdeydim.')} 집에 있었어요`,
        },
        items: [
          { q: '"3일 전에"', opts: ['üç gün önce', 'önce üç gün', 'üç günden önce'], a: 0, why: '시간 + önce (한국어와 같은 순서)' },
          { q: '"날씨가 좋았어요"', opts: ['Hava güzeldi.', 'Hava güzel oldu mı.', 'Hava güzeldim.'], a: 0, why: 'güzel + di (3인칭이라 인칭어미 없음)' },
        ],
        sents: [
          ["Geçen hafta Bursa'ya gittim.", '지난주에 부르사에 갔어요.'],
          ['İki gün önce geldik.', '우리는 이틀 전에 왔어요.'],
          ["Geçen yıl Türkiye'deydim.", '작년에 튀르키예에 있었어요.'],
          ['Tatil nasıldı?', '휴가 어땠어?'],
          ['Çok güzeldi!', '정말 좋았어!'],
          ['Ne zaman geldiniz?', '언제 오셨어요?'],
        ],
      },
      {
        id: 'u9l4', title: '여행 이야기', tr: "Kapadokya'ya gittik",
        words: ['gezmek', 'kalmak', 'cekmek', 'yuzmek', 'dinlenmek', 'otel', 'deniz', 'fotograf'],
        tip: {
          title: '이야기를 이어 말하기',
          html: `${b('Önce')} … ${b('sonra')} … (먼저 … 그다음 …)으로 과거 문장을 이어 보세요.<br>${b('Önce müzeyi gezdik, sonra denizde yüzdük.')} 먼저 박물관을 구경하고, 그다음 바다에서 수영했어요.<br><br>💡 카파도키아의 열기구는 ${b('balon')}, '열기구를 타다' = ${b('balona binmek')}`,
        },
        items: [
          { q: '"바다에서 수영했어요"', opts: ['Denizde yüzdüm.', 'Denize yüzdüm.', 'Denizden yüzdüm.'], a: 0, why: '행동하는 장소 = 장소격 -de' },
          { q: '"사진을 많이 찍었어요"', opts: ['Çok fotoğraf çektim.', 'Çok fotoğraf çekdim.', 'Çok fotoğrafı çektim.'], a: 0, why: 'k는 무성음 → -ti, 막연한 "많은 사진"이라 목적격 없음' },
        ],
        sents: [
          ["Geçen yaz Kapadokya'ya gittik.", '지난여름에 카파도키아에 갔어요.'],
          ['Üç gün bir otelde kaldık.', '사흘 동안 호텔에 묵었어요.'],
          ['Sabah balona bindik.', '아침에 열기구를 탔어요.'],
          ['Çok fotoğraf çektim.', '사진을 많이 찍었어요.'],
          ["Sonra Antalya'da denizde yüzdük.", '그다음 안탈리아 바다에서 수영했어요.'],
          ['Çok güzel bir tatildi!', '정말 멋진 휴가였어요!'],
        ],
      },
    ],
  },
  {
    id: 'u10', no: 10, title: '내 것, 네 것', tr: 'Benim, senin', color: '#be185d', notes: ['possessive', 'genitive'],
    desc: '소유 접미사, 속격 "~의", 소유 var/yok, 복합 명사',
    lessons: [
      {
        id: 'u10l1', title: '나의 ~', tr: 'Evim, evin, evi', notes: ['possessive'],
        words: ['araba', 'bilgisayar', 'anahtar', 'adres', 'numara', 'sifre', 'hediye', 'fikir'],
        tip: {
          title: '"내 ~"는 명사 끝에',
          html: `${b('ev-im')} 내 집 · ${b('ev-in')} 네 집 · ${b('ev-i')} 그의 집 · ${b('ev-imiz')} 우리 집 · ${b('ev-iniz')} 당신의 집 · ${b('ev-leri')} 그들의 집<br>모음 뒤: ${b('araba-m, araba-n, araba-sı')} (3인칭은 <b>-sı</b>)<br><br>💡 한국어는 '내 집'처럼 앞에 붙이지만 튀르키예어는 뒤에! 강조할 땐 ${b('benim evim')}처럼 둘 다 써요.`,
        },
        items: [
          { q: 'araba + (나의)', opts: ['arabam', 'arabım', 'arabayım'], a: 0, why: '모음 끝 → -m' },
          { q: 'ev + (그의)', opts: ['evi', 'evsi', 'evin'], a: 0, why: '자음 끝 → -i' },
          { q: 'araba + (그의)', opts: ['arabası', 'arabaı', 'arabasu'], a: 0, why: '모음 끝 3인칭 → -sı' },
          { q: 'anahtar + (우리의)', opts: ['anahtarımız', 'anahtarmız', 'anahtarımiz'], a: 0, why: '자음 끝 → -ımız (4형: a → ı)' },
        ],
        sents: [
          ['Arabam çok eski.', '내 차는 아주 오래됐어요.'],
          ['Bilgisayarın yeni mi?', '네 컴퓨터 새 거야?'],
          ['Anahtarımı bulamıyorum.', '내 열쇠를 못 찾겠어요.'],
          ['Adresiniz ne?', '주소가 어떻게 되세요?'],
          ['Telefon numaranı verir misin?', '전화번호 줄래?'],
          ['Bu senin hediyen!', '이건 네 선물이야!'],
        ],
      },
      {
        id: 'u10l2', title: '~의 (속격)', tr: "Ali'nin arabası", notes: ['genitive'],
        words: ['kimin', 'komsu', 'isim', 'kapi', 'renk', 'baskent', 'sayfa', 'ders'],
        tip: {
          title: '"A의 B" = A-nın B-si',
          html: `${b("Ali'nin araba-sı")} 알리의 차 — 소유자에 '의'(-ın), 소유물에 '그의'(-ı/-sı). <b>양쪽에 표시</b>하는 게 핵심!<br>모음 뒤엔 n: ${b("Ayşe'nin")}, ${b('kapının')}<br><br>예외: ${b('ben → benim')}, ${b('biz → bizim')}`,
        },
        items: [
          { q: 'Ali + 의', opts: ["Ali'nin", "Ali'in", "Ali'ın"], a: 0, why: '모음 끝 → n + in' },
          { q: '"선생님의 이름"', opts: ['öğretmenin adı', 'öğretmen adı', 'öğretmenin ad'], a: 0, why: '소유자 -in + 소유물 -ı' },
          { q: '"누구의 가방이에요?"', opts: ['Kimin çantası?', 'Kim çanta?', 'Kimin çanta mı?'], a: 0, why: 'kimin(누구의) + çanta-sı' },
        ],
        sents: [
          ['Bu kimin çantası?', '이거 누구 가방이에요?'],
          ["Ali'nin arabası kırmızı.", '알리의 차는 빨간색이에요.'],
          ['Komşumuzun kedisi çok sevimli.', '우리 이웃의 고양이는 정말 귀여워요.'],
          ['Öğretmenin adı ne?', '선생님 이름이 뭐예요?'],
          ['Kapının rengi mavi.', '문 색깔이 파래요.'],
          ["Türkiye'nin başkenti Ankara.", '튀르키예의 수도는 앙카라예요.'],
        ],
      },
      {
        id: 'u10l3', title: '가지고 있어요', tr: 'Sınavım var', notes: ['varyok', 'possessive'],
        words: ['misafir', 'randevu', 'rezervasyon', 'sinav', 'odev', 'toplanti', 'sorun'],
        tip: {
          title: '"나는 ~이 있다" = 소유 + var',
          html: `${b('Sınavım var.')} 내 시험이 있다 → 시험이 있어요<br>${b('Zamanım yok.')} 시간이 없어요 · ${b('Kardeşin var mı?')} 형제 있어?<br><br>💡 한국어도 '나는 시험이 있다'처럼 '있다'로 말하죠. 영어 have가 필요 없어요!<br>과거: ${b('Param vardı.')} 돈이 있었어요`,
        },
        items: [
          { q: '"(나는) 질문이 있어요"', opts: ['Sorum var.', 'Soru var benim.', 'Ben soru varım.'], a: 0, why: 'soru + m(나의) + var' },
          { q: '"우리는 시간이 없어요"', opts: ['Zamanımız yok.', 'Zamanımız değil.', 'Biz zaman yokuz.'], a: 0, why: 'zaman + ımız(우리의) + yok' },
          { q: '"예약하셨어요?(예약 있으세요?)"', opts: ['Rezervasyonunuz var mı?', 'Rezervasyon mu var?', 'Rezervasyonun varsınız?'], a: 0, why: 'rezervasyon + unuz(당신의) + var mı' },
        ],
        sents: [
          ['Yarın sınavım var.', '내일 시험이 있어요.'],
          ['Bugün çok ödevim var.', '오늘 숙제가 많아요.'],
          ['Rezervasyonunuz var mı?', '예약하셨어요?'],
          ['Saat üçte toplantım var.', '3시에 회의가 있어요.'],
          ['Sorun yok!', '문제없어요!'],
          ['Bu akşam misafirimiz var.', '오늘 저녁에 손님이 와요.'],
        ],
      },
      {
        id: 'u10l4', title: '명사 + 명사', tr: 'Türk kahvesi', notes: ['genitive'],
        words: ['dogum_gunu', 'hafta_sonu', 'ogle_yemegi', 'aksam_yemegi', 'yatak_odasi', 'telefon_numarasi', 'trafik_isigi', 'kredi_karti'],
        tip: {
          title: '복합 명사: 뒤 명사에 -(s)ı',
          html: `${b('Türk kahve-si')} 튀르키예 커피 · ${b('otobüs durağ-ı')} 버스 정류장 · ${b('doğum gün-ü')} 생일<br><br>💡 한국어 '버스 정류장', '생일'은 그냥 붙이지만, 튀르키예어는 <b>뒤 명사에 -(s)ı</b>를 꼭 붙여요. 앞 명사엔 '의'를 안 붙여요(특정한 소유가 아니니까).<br>여기에 격어미가 붙으면 n이 들어가요: ${b('hafta sonu-n-da')} 주말에`,
        },
        items: [
          { q: '"버스 정류장"', opts: ['otobüs durağı', 'otobüsün durağı', 'otobüs durak'], a: 0, why: '종류를 말하는 복합 명사 → 뒤에만 -ı' },
          { q: '"생일"', opts: ['doğum günü', 'doğumun günü', 'doğum gün'], a: 0, why: 'doğum(탄생) + gün-ü(날)' },
          { q: '"튀르키예 커피 한 잔"', opts: ['bir Türk kahvesi', 'bir Türk kahve', "bir Türk'ün kahvesi"], a: 0, why: 'Türk + kahve-si' },
        ],
        sents: [
          ['Doğum günün ne zaman?', '생일이 언제야?'],
          ['Hafta sonu ne yapıyorsun?', '주말에 뭐 해?'],
          ['Öğle yemeğinde ne yiyelim?', '점심에 뭐 먹을까?'],
          ['Otobüs durağı nerede?', '버스 정류장이 어디예요?'],
          ['Kredi kartı geçiyor mu?', '신용카드 되나요?'],
          ['Telefon numaranızı alabilir miyim?', '전화번호 받을 수 있을까요?'],
        ],
      },
    ],
  },
];
