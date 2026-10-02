// 문법 노트 (2): 미래·광범위·가능·의무·희망·명령/청유·비교·후치사·연결어미·관형절·조건·전언·숫자
const t = (s) => `<span class="tr">${s}</span>`;

export const NOTES2 = [
  {
    id: 'future', title: '미래 -ecek', sub: '"-(으)ㄹ 거예요 / -(으)ㄹ게요"',
    sections: [
      { table: { head: ['', 'gelmek 오다', 'okumak 읽다', 'yapmak 하다'], rows: [
        ['ben', t('geleceğim'), t('okuyacağım'), t('yapacağım')],
        ['sen', t('geleceksin'), t('okuyacaksın'), t('yapacaksın')],
        ['o', t('gelecek'), t('okuyacak'), t('yapacak')],
        ['biz', t('geleceğiz'), t('okuyacağız'), t('yapacağız')],
        ['siz', t('geleceksiniz'), t('okuyacaksınız'), t('yapacaksınız')],
        ['onlar', t('gelecekler'), t('okuyacaklar'), t('yapacaklar')],
      ] } },
      { p: `어간 + (모음 뒤 y) + <b>ecek/acak</b> + 인칭. ben·biz 앞에서는 k가 ğ로 부드러워져요: ${t('geleceğim')}, ${t('geleceğiz')}. 불규칙: ${t('git → gideceğim')}, ${t('ye → yiyeceğim')}, ${t('de → diyeceğim')}` },
      { ex: [
        ['Yarın sinemaya gideceğim.', '내일 영화 보러 갈 거예요.', 'gid-eceğ-im'],
        ['Bu akşam ne yapacaksın?', '오늘 저녁에 뭐 할 거야?', ''],
        ['Gelmeyeceğim.', '안 갈 거예요.', 'gel-me-y-eceğ-im'],
        ['Gelecek misin?', '올 거야?', 'gelecek + mi-sin'],
      ] },
      { tip: '한국어 "-(으)ㄹ 거예요"(예정)와 "-(으)ㄹ게요"(약속)를 둘 다 -ecek으로 말할 수 있어요: Seni arayacağım(전화할게).' },
      { warn: `말할 때는 짧게 들려요: ${t('geleceğim')} → [겔레짐]처럼. 듣기에서 놓치지 마세요.` },
      { drill: 'conj', label: '동사 활용 드릴' },
    ],
  },
  {
    id: 'aorist', title: '광범위 시제 -ir', sub: '습관 · 일반적 사실 · 정중한 부탁',
    sections: [
      { p: '늘 하는 일, 일반적인 사실, 성향, 그리고 정중한 부탁·제안·약속에 써요. 한국어 "-는다 / -곤 해요 / -(으)ㄹ게요 / -시겠어요?"에 해당해요.' },
      { table: { head: ['어간', '어미', '예'], rows: [
        ['모음으로 끝남', '-r', `${t('oku → okur')}, ${t('bekle → bekler')}`],
        ['1음절 (대부분)', '-er / -ar', `${t('yap → yapar')}, ${t('git → gider')}, ${t('iç → içer')}`],
        ['1음절 예외 13개', '-ir / -ır / -ur / -ür', `${t('al → alır')}, ${t('gel → gelir')}, ${t('bil → bilir')}, ${t('gör → görür')}, ${t('ol → olur')} …`],
        ['2음절 이상', '-ir / -ır / -ur / -ür', `${t('konuş → konuşur')}, ${t('öğren → öğrenir')}`],
      ] } },
      { p: `13개 예외: al, bil, bul, dur, gel, gör, kal, ol, öl, san, var, ver, vur — "알-빌-불-두르-겔-괴르-칼-올-욀-산-바르-베르-부르"` },
      { h: '부정은 모양이 특이해요' },
      { table: { head: ['ben', 'sen', 'o', 'biz', 'siz', 'onlar'], rows: [
        [t('gelmem'), t('gelmezsin'), t('gelmez'), t('gelmeyiz'), t('gelmezsiniz'), t('gelmezler')],
      ] } },
      { ex: [
        ['Her sabah çay içerim.', '매일 아침 차를 마셔요.', 'iç-er-im'],
        ['Kediler balık sever.', '고양이는 생선을 좋아해요.', '일반적 사실'],
        ['Çay içer misiniz?', '차 드시겠어요?', '정중한 권유'],
        ['Sigara içmem.', '저는 담배 안 피워요.', 'iç-me-m'],
        ['Yarın seni ararım.', '내일 너한테 전화할게.', '약속'],
      ] },
      { tip: '"-시겠어요?" = -ir misiniz?: Yardım eder misiniz?(도와주시겠어요?) 가게·식당에서 가장 공손하게 부탁하는 방법이에요.' },
      { drill: 'conj', label: '동사 활용 드릴' },
    ],
  },
  {
    id: 'abil', title: '가능 -ebil', sub: '"-(으)ㄹ 수 있다 / 없다"',
    sections: [
      { p: `어간 + (y) + <b>ebil/abil</b> + 시제. 보통 광범위 시제와 함께: ${t('gelebilirim')} 올 수 있어요` },
      { table: { head: ['', '할 수 있다', '할 수 없다'], rows: [
        ['ben', t('gelebilirim'), t('gelemem')],
        ['sen', t('gelebilirsin'), t('gelemezsin')],
        ['o', t('gelebilir'), t('gelemez')],
        ['biz', t('gelebiliriz'), t('gelemeyiz')],
        ['siz', t('gelebilirsiniz'), t('gelemezsiniz')],
        ['onlar', t('gelebilirler'), t('gelemezler')],
      ] } },
      { ex: [
        ['Türkçe konuşabilirim.', '튀르키예어를 할 수 있어요.', ''],
        ['Buraya oturabilir miyim?', '여기 앉아도 돼요?', '허락 구하기'],
        ['Bana yardım edebilir misiniz?', '저 좀 도와주실 수 있어요?', '부탁'],
        ['Anlayamadım.', '이해하지 못했어요.', 'anla-y-ama-dı-m'],
      ] },
      { warn: `"할 수 없다"는 <b>-eme-</b>예요: ${t('gel-eme-m')} (×gelebilmem). 다른 시제와도 붙어요: ${t('gelemedim')} 못 왔어요, ${t('gelemeyeceğim')} 못 갈 거예요.` },
      { tip: '"-아도 돼요?"(허락) = -ebilir miyim? 한국어처럼 \'가능\'과 \'허락\'을 같은 형태로 물어요.' },
      { drill: 'conj', label: '동사 활용 드릴' },
    ],
  },
  {
    id: 'nec', title: '의무 -meli', sub: '"-아야 해요"',
    sections: [
      { table: { head: ['', 'gitmek 가다', 'yapmak 하다'], rows: [
        ['ben', t('gitmeliyim'), t('yapmalıyım')],
        ['sen', t('gitmelisin'), t('yapmalısın')],
        ['o', t('gitmeli'), t('yapmalı')],
        ['biz', t('gitmeliyiz'), t('yapmalıyız')],
      ] } },
      { p: `일상 대화에서는 <b>-mem lazım / -mem gerek</b>(내가 ~하는 게 필요하다)도 많이 써요: ${t('Gitmem lazım.')} 가야 해요` },
      { ex: [
        ['Doktora gitmelisin.', '병원에 가 봐야 해.', '조언'],
        ['Şimdi gitmem lazım.', '이제 가야 해요.', 'git-me-m lazım'],
        ['Bunu yapmamalısın.', '이거 하면 안 돼.', 'yap-ma-malı-sın'],
      ] },
      { tip: '-meli는 "-아야 한다"와 "-는 게 좋겠다(조언)"를 함께 담아요. 부정 -memeli = "-면 안 된다".' },
    ],
  },
  {
    id: 'want', title: '희망 -mek istemek', sub: '"-고 싶다"',
    sections: [
      { p: `동사 원형(-mek) + ${t('istiyorum')} = "-고 싶어요". 한국어 "수영하-<b>고 싶</b>-어요"와 순서가 같아요!` },
      { ex: [
        ['Yüzmek istiyorum.', '수영하고 싶어요.', ''],
        ['Ne yapmak istiyorsun?', '뭐 하고 싶어?', ''],
        ['Hiçbir şey yapmak istemiyorum.', '아무것도 하고 싶지 않아요.', 'iste-mi-yor-um'],
        ['Bir kahve istiyorum.', '커피 한 잔 주세요(원해요).', '명사 + istiyorum'],
      ] },
      { p: `정중하게 제안할 땐 광범위 시제: ${t('Çay ister misiniz?')}(차 드시겠어요?)` },
      { tip: `다른 사람이 하길 원할 때는 -mesini: ${t('Gelmeni istiyorum.')}(네가 왔으면 좋겠어). 지금은 덩어리로 기억해 두세요.` },
    ],
  },
  {
    id: 'imperative', title: '명령과 청유', sub: '"-아라 / -세요 / -자"',
    sections: [
      { table: { head: ['', '긍정', '부정', '한국어'], rows: [
        ['너에게', t('gel'), t('gelme'), '와 / 오지 마'],
        ['그에게', t('gelsin'), t('gelmesin'), '오게 해'],
        ['당신·여러분', t('gelin'), t('gelmeyin'), '오세요 / 오지 마세요'],
        ['아주 공손히', t('geliniz'), t('gelmeyiniz'), '오십시오'],
        ['그들에게', t('gelsinler'), t('gelmesinler'), '오게 해'],
      ] } },
      { h: '청유 "-자, -ㄹ까?"' },
      { ex: [
        ['Hadi gidelim!', '자, 가자!', 'gid-elim'],
        ['Kahve içelim mi?', '커피 마실까?', 'iç-elim mi'],
        ['Yardım edeyim.', '제가 도와드릴게요.', 'ed-eyim'],
        ['Lütfen bekleyiniz.', '잠시 기다려 주십시오.', '안내 방송'],
      ] },
      { tip: '한국어 "-아라 / -세요 / -자"와 거의 1:1이에요. 동사 원형에서 -mek만 떼면 반말 명령: Gel!(와!), Bak!(봐!)' },
    ],
  },
  {
    id: 'comparison', title: '비교와 최상급', sub: '"더 · 가장 · ~보다 · ~처럼"',
    sections: [
      { table: { head: ['뜻', '튀르키예어', '예'], rows: [
        ['더 ~', t('daha'), `${t('daha büyük')} 더 큰`],
        ['가장 ~', t('en'), `${t('en güzel')} 가장 아름다운`],
        ['~보다', '-dan / -den', `${t("Ankara'dan büyük")} 앙카라보다 큰`],
        ['~만큼', t('kadar'), `${t('benim kadar')} 나만큼`],
        ['~처럼', t('gibi'), `${t('bal gibi')} 꿀처럼`],
      ] } },
      { ex: [
        ["İstanbul Ankara'dan daha büyük.", '이스탄불은 앙카라보다 더 커요.', "Ankara'-dan = 앙카라보다"],
        ["İstanbul Türkiye'nin en büyük şehri.", '이스탄불은 튀르키예에서 가장 큰 도시예요.', 'Türkiye-nin(의) en büyük şehr-i'],
        ['Abim benden uzun.', '오빠(형)는 나보다 키가 커요.', 'ben-den'],
      ] },
      { tip: '"보다"가 탈격 -dan이라는 것만 기억하면 끝! 어순도 한국어 "A는 B보다 더 크다"와 같아요.' },
      { warn: `대명사 + kadar/gibi는 속격: ${t('benim kadar')}, ${t('senin gibi')}, ${t('onun kadar')} (×ben kadar).` },
    ],
  },
  {
    id: 'postpositions', title: '후치사', sub: '"~와, ~위해, ~처럼, ~까지, ~후에"',
    sections: [
      { table: { head: ['후치사', '앞말', '뜻', '예'], rows: [
        [t('ile'), '-', '와/과, (으)로', t('arkadaşımla')],
        [t('için'), '-', '위해, 때문에', t('senin için')],
        [t('gibi'), '-', '처럼', t('çocuk gibi')],
        [t('kadar'), '-a', '까지', t('saat beşe kadar')],
        [t('göre'), '-a', '따르면, 보기에', t('bana göre')],
        [t('sonra'), '-dan', '후에', t('dersten sonra')],
        [t('önce'), '-dan', '전에', t('yemekten önce')],
        [t('beri'), '-dan', '이래로', t('iki yıldan beri')],
        [t('doğru'), '-a', '쪽으로', t('denize doğru')],
      ] } },
      { tip: '튀르키예어 후치사는 한국어 조사처럼 명사 <b>뒤에</b> 와요. "수업 후에" = dersten sonra — 어순까지 같죠!' },
      { warn: `ben·sen·o·biz·siz는 속격으로: ${t('benim için')}(나를 위해), ${t('onun gibi')}(그처럼).` },
    ],
  },
  {
    id: 'converbs', title: '연결어미', sub: '"-고, -면서, -ㄹ 때, -면, -ㄴ 후에"',
    sections: [
      { table: { head: ['어미', '한국어', '예'], rows: [
        ['-ıp / -ip', '-고 (이어서)', `${t('kalkıp gittim')} 일어나서 갔어요`],
        ['-arak / -erek', '-면서, -서 (방법)', `${t('yürüyerek gittik')} 걸어서 갔어요`],
        ['-ken', '-는 동안, -ㄹ 때', `${t('yemek yerken')} 먹는 동안`],
        ['-ınca / -ince', '-면, -자', `${t('eve gelince')} 집에 오면`],
        ['-dıktan sonra', '-(으)ㄴ 후에', `${t('yedikten sonra')} 먹은 후에`],
        ['-madan önce', '-기 전에', `${t('yatmadan önce')} 자기 전에`],
        ['-mak için', '-기 위해', `${t('öğrenmek için')} 배우기 위해`],
        ['-madan', '-지 않고', `${t('kahvaltı yapmadan')} 아침도 안 먹고`],
      ] } },
      { ex: [
        ['Sabah kalkıp kahvaltı yaptım.', '아침에 일어나서 아침을 먹었어요.', ''],
        ['Eve gelince seni ararım.', '집에 가면 너한테 전화할게.', ''],
        ['Yatmadan önce dişlerini fırçala.', '자기 전에 이 닦아.', ''],
        ['Türkçe öğrenmek için Türk dizileri izliyorum.', '튀르키예어를 배우려고 튀르키예 드라마를 봐요.', ''],
      ] },
      { tip: '한국어 연결어미와 거의 1:1이에요. 시제·인칭은 <b>마지막 동사에만</b> 붙여요: kalkıp(일어나고) + gittim(갔다).' },
    ],
  },
  {
    id: 'relative', title: '관형절', sub: '"내가 읽은 책" = okuduğum kitap',
    sections: [
      { p: '튀르키예어 관형절도 한국어처럼 <b>명사 앞</b>에 와요. 어순이 완전히 같아서 한국인에게 특히 쉬운 부분이에요!' },
      { table: { head: ['형태', '한국어', '예'], rows: [
        ['-an / -en', '-는 / -(으)ㄴ (그 사람이 하는)', `${t('gelen adam')} 오는 남자 · ${t('Türkçe konuşan öğrenci')} 튀르키예어를 하는 학생`],
        ['-dık + 소유', '-(으)ㄴ / -는 (내가 하는)', `${t('okuduğum kitap')} 내가 읽은 책 · ${t('sevdiğin şarkı')} 네가 좋아하는 노래`],
        ['-acak + 소유', '-(으)ㄹ (내가 할)', `${t('okuyacağım kitap')} 내가 읽을 책 · ${t('gideceğimiz yer')} 우리가 갈 곳`],
      ] } },
      { ex: [
        ['En sevdiğim yemek mantı.', '내가 제일 좋아하는 음식은 만트예요.', 'sev-diğ-im'],
        ['Dün okuduğum kitap çok ilginçti.', '어제 읽은 책은 정말 재미있었어요.', 'oku-duğ-um'],
        ['Türkçe konuşan bir rehber arıyorum.', '튀르키예어를 하는 가이드를 찾고 있어요.', 'konuş-an'],
      ] },
      { tip: '주어가 꾸밈받는 명사 자신이면 -en("오는 남자" = 남자가 온다), 아니면 -dık + 소유("내가 읽은 책" = 내가 책을 읽었다).' },
    ],
  },
  {
    id: 'conditional', title: '조건 -se', sub: '"-(으)면"',
    sections: [
      { p: `실제 조건은 광범위 시제 + se: ${t('gelirsen')} 네가 오면 · ${t('yağarsa')} (비가) 오면. var/yok도: ${t('varsa')} 있으면, ${t('yoksa')} 없으면` },
      { ex: [
        ['Zamanın varsa bize gel.', '시간 있으면 우리 집에 와.', 'var-sa'],
        ["Türkiye'ye gelirsen beni ara.", '튀르키예에 오면 나한테 연락해.', 'gel-ir-se-n'],
        ['Eğer yağmur yağarsa evde kalırız.', '만약 비가 오면 집에 있을 거예요.', ''],
      ] },
      { p: `어간 + se는 바람·가정: ${t('Keşke gelsen!')} 네가 오면 좋을 텐데! · ${t('Ne yapsam?')} 뭘 하지?` },
      { tip: '"eğer(만약)"는 생략해도 돼요. 한국어 "만약"처럼 강조용이에요.' },
    ],
  },
  {
    id: 'evidential', title: '전언·추측 -mış', sub: '"-았대요 / -았더라고요"',
    sections: [
      { p: '직접 보지 않고 <b>들은 이야기</b>나, 뒤늦게 <b>알게 된 사실</b>에 -mış/-miş/-muş/-müş를 써요.' },
      { table: { head: ['직접 경험 -dı', '들음·추측 -mış'], rows: [
        [`${t('Ali geldi.')} 알리가 왔어(내가 봤어)`, `${t('Ali gelmiş.')} 알리가 왔대 / 왔네`],
        [`${t('Hava güzeldi.')} 날씨가 좋았어`, `${t('Hava güzelmiş.')} 날씨가 좋았대`],
      ] } },
      { ex: [
        ['Ahmet evlenmiş!', '아흐메트가 결혼했대!', 'evlen-miş'],
        ['Bu lokanta çok ünlüymüş.', '이 식당 아주 유명하대요.', 'ünlü-y-müş'],
        ['Bir varmış, bir yokmuş…', '옛날 옛적에…', '옛날이야기의 시작'],
      ] },
      { tip: '한국어 "-대요 / -더라고요"처럼 정보의 출처를 문법으로 구분해요. 뉴스·소문·동화에서 자주 들려요.' },
    ],
  },
  {
    id: 'numbers', title: '숫자', sub: '한자어 수사처럼 조립',
    sections: [
      { table: { head: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], rows: [
        [t('bir'), t('iki'), t('üç'), t('dört'), t('beş'), t('altı'), t('yedi'), t('sekiz'), t('dokuz'), t('on')],
      ] } },
      { table: { head: ['20', '30', '40', '50', '60', '70', '80', '90', '100', '1000'], rows: [
        [t('yirmi'), t('otuz'), t('kırk'), t('elli'), t('altmış'), t('yetmiş'), t('seksen'), t('doksan'), t('yüz'), t('bin')],
      ] } },
      { p: `큰 단위부터 이어 말해요: 3,456 = ${t('üç bin dört yüz elli altı')}. 100과 1000 앞에는 bir를 안 붙여요: ${t('yüz')}, ${t('bin')} (하지만 ${t('bir milyon')}).` },
      { p: `서수 -(ı)ncı: ${t('birinci')} 첫째, ${t('ikinci')}, ${t('üçüncü')}, ${t('dördüncü')} · 가격: 45,50 TL = ${t('kırk beş lira elli kuruş')}` },
      { tip: '"이십오" = 이(2)+십(10)+오(5)처럼, yirmi(20)+beş(5) = 25. 한자어 수사와 같은 조립 방식이에요.' },
      { drill: 'numbers', label: '숫자 드릴' },
    ],
  },
];
