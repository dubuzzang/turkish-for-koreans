import { NOTES2 } from './notes-2.js';

// 문법 노트 — 한국어와 비교하며 설명. 섹션 종류: p(문단) h(소제목) table ex(예문) tip(한국어 비교) warn(흔한 실수) drill(연습 링크)
const t = (s) => `<span class="tr">${s}</span>`;
const m = (s, k) => `<span class="m m-${k}">${s}</span>`;

const NOTES1 = [
  {
    id: 'overview', title: '튀르키예어와 한국어', sub: '닮은 점과 다른 점',
    sections: [
      { p: '튀르키예어는 한국어 화자에게 유럽 언어보다 훨씬 친절한 언어예요. 문장을 만드는 방식이 거의 같거든요.' },
      { table: { head: ['특징', '튀르키예어', '한국어'], rows: [
        ['어순(주어-목적어-동사)', t('Ben kitap okuyorum.'), '나는 책을 읽어요.'],
        ['조사·어미를 붙이는 교착어', `${t('ev')}${m('ler', 'pl')}${m('im', 'poss')}${m('de', 'case')}`, '집-들-내-에서 → 내 집들에서'],
        ['후치사(뒤에 오는 말)', t('masanın üstünde'), '책상 위에'],
        ['모음조화', `${t('evler')} / ${t('okullar')}`, '잡아 / 먹어'],
        ['주어 생략', t('Geliyorum.'), '(나) 가요.'],
        ['반말·존댓말', `${t('sen')} / ${t('siz')}`, '너 / 당신'],
        ['꾸미는 말이 앞에', t('okuduğum kitap'), '내가 읽은 책'],
        ['관사·문법적 성 없음', t('kitap'), '책'],
      ] } },
      { h: '다른 점 네 가지' },
      { p: `① 동사 끝에 인칭이 붙어요: ${t('geliyor-um')}(나), ${t('geliyor-sun')}(너). 그래서 주어를 자주 생략해요.<br>② '을/를'은 <b>정해진 대상</b>에만 붙여요: ${t('elma yiyorum')}(사과 먹어요) / ${t('elmayı yedim')}(그 사과를 먹었어요).<br>③ 소유를 양쪽에 표시해요: ${t("Ali'nin arabası")} = 알리-의 차-그의.<br>④ 라틴 문자를 쓰지만 쓰는 대로 읽어요.` },
      { ex: [
        ['Ben her gün Türkçe çalışıyorum.', '나는 매일 튀르키예어를 공부해요.', 'Ben 나는 · her gün 매일 · Türkçe 튀르키예어 · çalış-ıyor-um 공부하-고 있-(나)'],
        ['Arkadaşımın evinde kahve içtik.', '친구 집에서 커피를 마셨어요.', 'arkadaş-ım-ın 친구-내-의 · ev-i-nde 집-그의-에서 · iç-ti-k 마시-었-(우리)'],
      ] },
      { tip: '조사 대응만 익혀도 문장이 술술 나와요: <b>-da</b> 에/에서 · <b>-a</b> 에/로 · <b>-dan</b> 에서/부터 · <b>-ı</b> 을/를 · <b>-ın</b> 의 · <b>-la</b> 와/로' },
      { drill: 'cases', label: '격어미 드릴로 연습하기' },
    ],
  },
  {
    id: 'harmony', title: '모음조화', sub: '어미가 앞 모음을 따라가요',
    sections: [
      { p: '튀르키예어 어미의 모음은 단어의 <b>마지막 모음</b>에 따라 바뀌어요. 한국어 \'잡아/먹어\'와 같은 원리인데, 훨씬 철저하게 지켜요.' },
      { h: '모음 8개, 두 무리' },
      { table: { head: ['', '뒤 모음 (입 안쪽)', '앞 모음 (입 앞쪽)'], rows: [
        ['입술 평평', 'a · ı', 'e · i'],
        ['입술 둥글게', 'o · u', 'ö · ü'],
      ] } },
      { h: '2형 조화: a / e' },
      { p: '마지막 모음이 a·ı·o·u면 <b>a</b>, e·i·ö·ü면 <b>e</b>. 복수 -lar/-ler, 장소 -da/-de, 방향 -a/-e, 출발 -dan/-den 등이 이 규칙을 따라요.' },
      { ex: [
        ['kitaplar', '책들', 'kit-a-p → 마지막 a → -lar'],
        ['evler', '집들', 'e → -ler'],
        ['okulda', '학교에서', 'u → -da'],
        ['gözde', '눈에', 'ö → -de'],
      ] },
      { h: '4형 조화: ı / i / u / ü' },
      { table: { head: ['마지막 모음', '어미 모음', '예 (나의 ~)'], rows: [
        ['a, ı', 'ı', `${t('adım')} 내 이름 · ${t('kızım')} 내 딸`],
        ['e, i', 'i', `${t('evim')} 내 집 · ${t('kedim')} 내 고양이`],
        ['o, u', 'u', `${t('okulum')} 내 학교 · ${t('yolum')} 내 길`],
        ['ö, ü', 'ü', `${t('gözüm')} 내 눈 · ${t('gülüm')} 내 장미`],
      ] } },
      { p: '4형은 "입술 모양"까지 맞춰요. 입술을 둥글게 하는 o·u·ö·ü 뒤에는 둥근 u·ü가 와요. 소유 접미사, 목적격, 의문 첨사 mi, 과거 -dı, 서술 -ım 등이 4형이에요.' },
      { tip: '한국어 \'잡<b>아</b> / 먹<b>어</b>\', \'알<b>아</b> / 읽<b>어</b>\'처럼 앞 모음이 양성(ㅏ·ㅗ)이면 \'아\', 아니면 \'어\'를 고르죠? 2형 조화가 바로 이 원리예요. 4형은 거기에 \'둥근 입\'까지 따지는 버전!' },
      { warn: `단어 전체가 아니라 <b>마지막 모음</b>만 보세요: öğretm<b>e</b>n → ${t('öğretmenler')}. 외래어 예외도 있어요: ${t('saat → saatler')}(×saatlar), ${t('meşgul → meşgulüm')}.` },
      { warn: `조화하지 않는 어미도 있어요: -yor(현재진행), -ken(~할 때), -ki, -leyin. ${t('geliyor')} / ${t('okuyor')}의 yor는 늘 같아요.` },
      { drill: 'harmony', label: '모음조화 드릴' },
    ],
  },
  {
    id: 'consonants', title: '자음 규칙', sub: '부딪히면 바뀌어요',
    sections: [
      { h: '① d → t (무성음 뒤)' },
      { p: 'p·ç·t·k·f·s·ş·h(무성음) 뒤에서 d로 시작하는 어미는 t가 돼요. 외우는 주문: <b>Fıstıkçı Şahap</b>(땅콩장수 샤합) — 이 말에 든 자음이 바로 그 8개예요.' },
      { ex: [
        ['kitapta', '책에(서)', 'kitap + da → ta'],
        ['işte', '직장에(서)', 'iş + de → te'],
        ['gittim', '갔어요', 'git + di → ti'],
        ['Türkçe', '튀르키예어', 'Türk + ce → çe'],
      ] },
      { tip: '한국어 \'학교[학꾜]\'처럼 받침 ㄱ 뒤에서 예사소리가 된소리로 바뀌는 \'경음화\'와 비슷해요. 튀르키예어는 그 변화를 철자에 그대로 써요.' },
      { h: '② p ç t k → b c d ğ (모음 앞에서 부드럽게)' },
      { p: '여러 음절 단어가 p·ç·t·k로 끝나고 모음으로 시작하는 어미가 붙으면 부드러운 소리로 바뀌어요.' },
      { table: { head: ['바뀜', '예'], rows: [
        ['p → b', `${t('kitap')} → ${t('kitabı')} 책을`],
        ['ç → c', `${t('ağaç')} → ${t('ağacı')} 나무를`],
        ['t → d', `${t('gitmek')} → ${t('gidiyor')} 가고 있다`],
        ['k → ğ', `${t('çocuk')} → ${t('çocuğu')} 아이를`],
        ['nk → ng', `${t('renk')} → ${t('rengi')} 색을`],
      ] } },
      { tip: '한국어 ㄷ 불규칙 \'듣다 → 들어\'처럼, 모음 어미 앞에서 어간 끝 자음이 바뀌는 현상이에요.' },
      { warn: `한 음절 단어는 대부분 안 바뀌어요: ${t('top → topu')}, ${t('saç → saçı')}, ${t('et → eti')} (예외: ${t('renk → rengi')}, ${t('dört → dördü')}, ${t('kalp → kalbi')}). 고유명사도 안 바뀌어요.` },
      { h: '③ 모음 탈락' },
      { p: `몇몇 2음절 단어는 모음 어미 앞에서 둘째 모음이 빠져요: ${t('ağız → ağzı')} 입을, ${t('burun → burnu')} 코를, ${t('isim → ismim')} 내 이름, ${t('şehir → şehri')}, ${t('oğul → oğlu')}.` },
      { drill: 'cases', label: '격어미 드릴' },
    ],
  },
  {
    id: 'buffer', title: '연결 자음 y · n · s', sub: '모음끼리 부딪히지 않게',
    sections: [
      { p: '튀르키예어는 모음과 모음이 바로 만나는 걸 피해요. 그래서 사이에 자음을 끼워 넣어요.' },
      { table: { head: ['연결음', '언제', '예'], rows: [
        ['y', '모음 끝 + 격·인칭 어미', `${t('araba-y-a')} 차에 · ${t('öğrenci-y-im')} 학생이에요`],
        ['n', '3인칭 소유 뒤 격어미 · 속격', `${t('ev-i-n-de')} 그의 집에서 · ${t('araba-n-ın')} 차의`],
        ['s', '모음 끝 + 3인칭 소유', `${t('araba-s-ı')} 그의 차`],
      ] } },
      { tip: '한국어는 반대로 <b>자음 뒤에 \'으\'</b>를 넣어요: 집-<b>으</b>-로 / 학교-로, 먹-<b>으</b>-면 / 가-면. 두 언어 모두 소리가 부딪히지 않게 연결음을 넣는 거예요!' },
      { ex: [
        ['Arabaya bindim.', '차에 탔어요.', 'araba + y + a'],
        ['Öğrenciyim.', '학생이에요.', 'öğrenci + y + im'],
        ['Annesinin evinde kaldım.', '그의 엄마 집에서 묵었어요.', 'anne-si-n-in ev-i-n-de'],
      ] },
    ],
  },
  {
    id: 'pronouns', title: '인칭대명사와 존댓말', sub: 'sen과 siz',
    sections: [
      { table: { head: ['튀르키예어', '한국어', '메모'], rows: [
        [t('ben'), '나, 저', ''],
        [t('sen'), '너', '반말'],
        [t('o'), '그, 그녀, 그것', '남녀 구분 없음'],
        [t('biz'), '우리', ''],
        [t('siz'), '당신, 여러분', '존댓말 + 복수'],
        [t('onlar'), '그들', ''],
      ] } },
      { p: '동사 끝 인칭어미가 주어를 알려 주니까 대명사는 강조할 때만 써요: (Ben) Koreliyim.' },
      { tip: 'sen/siz는 한국어 반말/존댓말과 같은 감각이에요. 처음 만난 사람, 가게 직원, 어른에게는 siz! 친해지면 "Senli benli konuşalım mı?"(말 놓을까요?)라고 하기도 해요.' },
      { h: '대명사의 격 변화' },
      { table: { head: ['', '~의', '~을', '~에게', '~에(서)'], rows: [
        ['ben', t('benim'), t('beni'), t('bana'), t('bende')],
        ['sen', t('senin'), t('seni'), t('sana'), t('sende')],
        ['o', t('onun'), t('onu'), t('ona'), t('onda')],
        ['biz', t('bizim'), t('bizi'), t('bize'), t('bizde')],
        ['siz', t('sizin'), t('sizi'), t('size'), t('sizde')],
        ['onlar', t('onların'), t('onları'), t('onlara'), t('onlarda')],
      ] } },
      { warn: `${t('bana')}, ${t('sana')}는 불규칙이에요(×bene, ×sene). o는 격어미 앞에서 n이 붙어요: ${t('onu')}, ${t('ona')}, ${t('onda')}.` },
    ],
  },
  {
    id: 'copula', title: '"~이다" 붙이기', sub: '-(y)ım, -sın … 그리고 değil',
    sections: [
      { p: '명사·형용사 뒤에 인칭어미를 붙이면 "~이다"가 돼요. 3인칭은 아무것도 안 붙여요.' },
      { table: { head: ['인칭', '어미', 'öğrenci 학생', 'doktor 의사'], rows: [
        ['ben', '-(y)ım', t('öğrenciyim'), t('doktorum')],
        ['sen', '-sın', t('öğrencisin'), t('doktorsun')],
        ['o', '–', t('öğrenci'), t('doktor')],
        ['biz', '-(y)ız', t('öğrenciyiz'), t('doktoruz')],
        ['siz', '-sınız', t('öğrencisiniz'), t('doktorsunuz')],
        ['onlar', '-lar', t('öğrenciler'), t('doktorlar')],
      ] } },
      { p: `장소와 함께 쓰면 "~에 있다": ${t('Evdeyim')} = ev-de(집에) + -yim → 집에 있어요. "있다"를 따로 쓰지 않아요!` },
      { h: '부정: değil' },
      { ex: [
        ['Öğrenci değilim.', '저는 학생이 아니에요.', 'öğrenci + değil + im'],
        ['Bu kahve değil, çay.', '이건 커피가 아니라 차예요.', ''],
      ] },
      { h: '과거: -(y)dı' },
      { ex: [
        ['Dün evdeydim.', '어제 집에 있었어요.', 'ev-de-y-di-m'],
        ['Hava çok güzeldi.', '날씨가 정말 좋았어요.', 'güzel-di'],
      ] },
      { tip: '한국어 \'학생-<b>이</b>에요\'가 모음 뒤에서 \'학교-예요\'로 바뀌듯, 튀르키예어도 모음 뒤에 y를 넣어 연결해요: öğrenci-<b>y</b>-im.' },
      { drill: 'copula', label: '"~이다" 드릴' },
    ],
  },
  {
    id: 'question', title: '의문 첨사 mi', sub: '"~니? / ~까?"',
    sections: [
      { p: '예·아니요 질문은 묻고 싶은 말 뒤에 <b>mi</b>(mı/mi/mu/mü)를 띄어 써요.' },
      { ex: [
        ['Çay mı?', '차예요?', 'çay(a) → mı'],
        ['Sen Türk müsün?', '너 튀르키예 사람이야?', 'Türk(ü) → mü + sün'],
        ['Geliyor musun?', '(너) 와?', 'geliyor + mu + sun'],
        ['Geldin mi?', '(너) 왔어?', 'geldin + mi'],
      ] },
      { p: `mi의 위치로 강조점을 바꿀 수 있어요: ${t('Sen mi geldin?')}(네가 왔어?) / ${t('Sen geldin mi?')}(너 왔어?)` },
      { warn: `현재진행·미래·광범위·"~이다"에서는 인칭어미가 mi 뒤로 가요: ${t('Geliyor musun?')} (×Geliyorsun mu?). 과거 -dı는 그대로: ${t('Geldin mi?')}` },
      { tip: '한국어는 \'-니?/-까?\'를 동사에 붙이지만, 튀르키예어 mi는 따로 띄어 쓰고 모음조화만 따라가요.' },
    ],
  },
  {
    id: 'demonstratives', title: '이 · 그 · 저', sub: 'bu · şu · o',
    sections: [
      { table: { head: ['튀르키예어', '한국어', '거리'], rows: [
        [t('bu'), '이(것)', '가까이'],
        [t('şu'), '그(것)·저(것)', '가리키며, 조금 떨어진'],
        [t('o'), '저(것)·그(것)', '멀리 / 대화에 나온 것'],
      ] } },
      { ex: [
        ['Bu ne?', '이건 뭐예요?', ''],
        ['Şu kim?', '저 사람 누구야?', ''],
        ['O kitap senin mi?', '그 책 네 거야?', ''],
        ['Burası neresi?', '여기는 어디예요?', 'bura(이곳) + sı'],
      ] },
      { p: `장소: ${t('burada')} 여기에 · ${t('şurada')} 저기에 · ${t('orada')} 거기에` },
      { tip: '한국어 \'이/그/저\'와 거의 같은 3단계 체계예요. şu는 손으로 가리키며 "저거"라고 할 때 자주 써요.' },
    ],
  },
  {
    id: 'plural', title: '복수 -lar/-ler', sub: '"-들"',
    sections: [
      { p: '복수는 -lar/-ler(2형 조화)예요.' },
      { ex: [
        ['kitaplar', '책들', ''],
        ['evler', '집들', ''],
        ['Çocuklar parkta oynuyor.', '아이들이 공원에서 놀고 있어요.', ''],
      ] },
      { warn: `숫자·çok(많은)·kaç(몇) 뒤에는 단수: ${t('iki kedi')} (×iki kediler), ${t('çok insan')}, ${t('kaç kişi?')}` },
      { tip: '한국어도 \'사과 세 개\'라고 하지 \'사과들 세 개\'라고 하지 않죠. 복수를 생략하는 감각이 한국어와 닮았어요.' },
      { p: `존중의 복수: 3인칭에 -ler를 붙여 높이기도 해요: ${t('Hocam geliyorlar.')} (선생님께서 오고 계세요)` },
    ],
  },
  {
    id: 'varyok', title: 'var / yok', sub: '있다 · 없다',
    sections: [
      { p: '<b>var</b> = 있다, <b>yok</b> = 없다. 존재와 소유를 모두 나타내요.' },
      { ex: [
        ['Masada bir kitap var.', '책상에 책이 한 권 있어요.', ''],
        ['Su yok.', '물이 없어요.', ''],
        ['Kardeşin var mı?', '형제 있어?', 'kardeş-in(너의 형제) var mı'],
        ['Param yoktu.', '돈이 없었어요.', 'yok + tu (과거)'],
      ] },
      { p: `소유: 소유 접미사 + var → ${t('Arabam var')} (내 차가 있다 = 나는 차가 있다)` },
      { tip: '\'나는 차가 있다\' — 한국어도 영어 have 없이 \'있다\'로 소유를 말하죠. 튀르키예어도 똑같아요!' },
      { warn: `"~이 아니다"는 değil, "~이 없다"는 yok: ${t('Ev değil')}(집이 아니다) / ${t('Ev yok')}(집이 없다)` },
    ],
  },
  {
    id: 'cases', title: '격어미 한눈에', sub: '조사 대응표',
    sections: [
      { table: { head: ['격', '어미', '한국어', 'ev 집', 'araba 차', 'kitap 책'], rows: [
        ['주격', '–', '은/는/이/가', t('ev'), t('araba'), t('kitap')],
        ['목적격', '-(y)ı', '을/를(정해진)', t('evi'), t('arabayı'), t('kitabı')],
        ['여격', '-(y)a', '에, 에게, 로', t('eve'), t('arabaya'), t('kitaba')],
        ['장소격', '-da', '에, 에서', t('evde'), t('arabada'), t('kitapta')],
        ['탈격', '-dan', '에서, 부터, 보다', t('evden'), t('arabadan'), t('kitaptan')],
        ['속격', '-(n)ın', '의', t('evin'), t('arabanın'), t('kitabın')],
        ['도구격', '-(y)la', '와, 로', t('evle'), t('arabayla'), t('kitapla')],
      ] } },
      { tip: `순서까지 한국어와 같아요: ${t('ev-ler-im-de')} = 집-들-내-에서 → "내 집들에서"` },
      { drill: 'cases', label: '격어미 드릴' },
    ],
  },
  {
    id: 'locative', title: '장소격 -da', sub: '"~에, ~에서"',
    sections: [
      { p: '위치(~에)와 행동하는 장소(~에서)를 모두 -da/-de로 나타내요. 시간에도 써요.' },
      { ex: [
        ['Evdeyim.', '집에 있어요.', 'ev-de-y-im'],
        ['Okulda Türkçe öğreniyorum.', '학교에서 튀르키예어를 배워요.', ''],
        ['Saat beşte buluşalım.', '5시에 만나요.', 'beş-te'],
        ["İstanbul'da yaşıyorum.", '이스탄불에 살아요.', ''],
      ] },
      { warn: `무성음 뒤에는 -ta/-te: ${t('kitapta')}, ${t('sokakta')}, ${t("Paris'te")}` },
      { tip: '한국어 \'에\'와 \'에서\'를 하나로 쓰는 셈이에요. "집에 있다"도 "집에서 일한다"도 -de.' },
    ],
  },
  {
    id: 'dative', title: '여격 -a', sub: '"~에, ~로, ~에게"',
    sections: [
      { p: '방향(~에, ~로)과 받는 사람(~에게)을 나타내요. 모음 뒤에는 y를 넣어요.' },
      { ex: [
        ['Okula gidiyorum.', '학교에 가요.', 'okul-a'],
        ['Bana bak!', '나 좀 봐!', 'ben → bana (불규칙)'],
        ["Ankara'ya otobüsle gidiyoruz.", '앙카라에 버스로 가요.', "Ankara'-y-a"],
        ['Anneme hediye aldım.', '엄마에게 선물을 샀어요.', 'anne-m-e'],
      ] },
      { warn: `여격과 짝을 이루는 동사: ${t('-e bakmak')}(~을 보다), ${t('-e binmek')}(~에 타다), ${t('-e yardım etmek')}(~을 돕다), ${t('-e başlamak')}(~을 시작하다), ${t('-e benzemek')}(~와 닮다)` },
      { tip: 'binmek(타다)는 한국어 \'버스<b>에</b> 타다\'와 조사까지 같아요. 반대로 \'~을 보다\'는 여격(bana bak)이라 주의!' },
    ],
  },
  {
    id: 'ablative', title: '탈격 -dan', sub: '"~에서, ~부터, ~보다"',
    sections: [
      { p: '출발점(~에서, ~부터), 비교(~보다), 원인을 나타내요.' },
      { ex: [
        ["Kore'den geliyorum.", '한국에서 왔어요.', ''],
        ['Saat dokuzdan beşe kadar çalışıyorum.', '9시부터 5시까지 일해요.', 'dokuz-dan … beş-e kadar'],
        ["Ankara İstanbul'dan küçük.", '앙카라는 이스탄불보다 작아요.', '-dan = 보다'],
        ['Köpekten korkuyorum.', '개가 무서워요.', 'köpek-ten'],
      ] },
      { tip: '"~에서 ~까지" = -dan … -a kadar. 한국어와 순서가 똑같죠! 비교의 "보다"도 -dan 하나로 해결돼요.' },
      { warn: 'inmek(내리다)·çıkmak(나가다)·korkmak(무서워하다)·hoşlanmak(좋아하다)는 -dan과 함께 써요.' },
    ],
  },
  {
    id: 'accusative', title: '목적격 -ı', sub: '"을/를" — 정해진 대상에만',
    sections: [
      { p: '튀르키예어의 "을/를"은 <b>특정한(정해진) 대상</b>일 때만 붙어요.' },
      { table: { head: ['막연한 대상', '정해진 대상'], rows: [
        [`${t('Kitap okuyorum.')} 책 읽어요`, `${t('Kitabı okuyorum.')} 그 책을 읽어요`],
        [`${t('Elma aldım.')} 사과 샀어`, `${t('Elmayı aldım.')} 그 사과를 샀어`],
        [`${t('Su içtim.')} 물 마셨어`, `${t('Suyu içtim.')} 그 물을 마셨어`],
      ] } },
      { p: `대명사·고유명사·소유가 붙은 명사는 항상 목적격: ${t('Seni seviyorum.')}, ${t("İstanbul'u gezdik.")}, ${t('Arabamı sattım.')}` },
      { tip: '한국어도 "책 읽어요"처럼 조사를 자주 생략하죠? 튀르키예어는 생략 여부가 \'정해진 것이냐\'로 결정된다고 생각하면 쉬워요.' },
    ],
  },
  {
    id: 'instrumental', title: 'ile (-la/-le)', sub: '"~와(함께), ~로(수단)"',
    sections: [
      { p: '함께하는 사람(~와)과 수단(~로)을 나타내요. 붙여 쓰면 -(y)la/-(y)le.' },
      { ex: [
        ['Arkadaşımla geldim.', '친구와 왔어요.', 'arkadaş-ım-la'],
        ['Otobüsle gidiyoruz.', '버스로 가요.', 'otobüs-le'],
        ['Taksiyle geldim.', '택시로 왔어요.', 'taksi-y-le'],
        ['Ali ile Ayşe', '알리와 아이셰', ''],
      ] },
      { tip: '한국어 \'-와/과\'와 \'-(으)로\'가 하나예요. 모음 뒤 y는 \'학교로 / 집으로\'의 매개모음과 대칭!' },
    ],
  },
  {
    id: 'possessive', title: '소유 접미사', sub: '"내 ~, 네 ~, 그의 ~"',
    sections: [
      { table: { head: ['', '자음 뒤', '모음 뒤', 'ev 집', 'araba 차'], rows: [
        ['나의', '-ım', '-m', t('evim'), t('arabam')],
        ['너의', '-ın', '-n', t('evin'), t('araban')],
        ['그의', '-ı', '-sı', t('evi'), t('arabası')],
        ['우리의', '-ımız', '-mız', t('evimiz'), t('arabamız')],
        ['당신의', '-ınız', '-nız', t('eviniz'), t('arabanız')],
        ['그들의', '-ları', '-ları', t('evleri'), t('arabaları')],
      ] } },
      { p: `대명사와 함께 쓰면 강조돼요: ${t('benim evim')}(바로 내 집). 모음으로 시작하므로 연음에 주의: ${t('kitap → kitabım')}, ${t('çocuk → çocuğum')}.` },
      { tip: '한국어는 \'내 집\'처럼 앞에 소유자를 쓰지만, 튀르키예어는 명사 끝에 \'내\'를 붙여요. 그래서 evim 한 단어로 \'내 집\'.' },
      { warn: `3인칭 소유 뒤 격어미에는 n이 들어가요: ${t('evi-n-de')} 그의 집에서, ${t('arabası-n-ı')} 그의 차를` },
      { drill: 'poss', label: '소유 접미사 드릴' },
    ],
  },
  {
    id: 'genitive', title: '속격과 복합 명사', sub: '"A의 B" = A-nın B-si',
    sections: [
      { p: '소유자에는 "의"(-ın), 소유물에는 "그의"(-ı/-sı)를 붙여요. 양쪽에 표시하는 게 핵심!' },
      { ex: [
        ["Ali'nin arabası", '알리의 차', "Ali'-nin araba-sı"],
        ['annemin adı', '우리 엄마의 이름', 'anne-m-in ad-ı'],
        ["Türkiye'nin başkenti", '튀르키예의 수도', ''],
        ['kapının rengi', '문의 색깔', 'kapı-nın reng-i'],
      ] },
      { h: '복합 명사 (의 없이)' },
      { p: `종류나 이름을 말할 때는 앞 명사의 -ın을 빼요: ${t('Türk kahvesi')} 튀르키예 커피, ${t('otobüs durağı')} 버스 정류장, ${t('doğum günü')} 생일` },
      { table: { head: ['특정한 소유', '종류·이름'], rows: [
        [`${t('okulun kapısı')} 그 학교의 문`, `${t('okul kapısı')} 학교 정문`],
        [`${t("Ali'nin kitabı")} 알리의 책`, `${t('Türkçe kitabı')} 튀르키예어 책`],
      ] } },
      { tip: '한국어 \'버스 정류장\', \'생일\'은 그냥 나란히 놓지만, 튀르키예어는 뒤 명사에 -(s)ı를 꼭 붙여서 묶어요.' },
      { warn: `ben·biz의 속격은 ${t('benim')}·${t('bizim')}이에요 (×benin, ×bizin).` },
    ],
  },
  {
    id: 'prog', title: '현재진행 -iyor', sub: '"-고 있다 / -어요"',
    sections: [
      { p: '지금 하는 일, 요즘 하는 일, 가까운 계획을 말해요.' },
      { table: { head: ['', 'gelmek 오다', 'okumak 읽다', 'yapmak 하다'], rows: [
        ['ben', t('geliyorum'), t('okuyorum'), t('yapıyorum')],
        ['sen', t('geliyorsun'), t('okuyorsun'), t('yapıyorsun')],
        ['o', t('geliyor'), t('okuyor'), t('yapıyor')],
        ['biz', t('geliyoruz'), t('okuyoruz'), t('yapıyoruz')],
        ['siz', t('geliyorsunuz'), t('okuyorsunuz'), t('yapıyorsunuz')],
        ['onlar', t('geliyorlar'), t('okuyorlar'), t('yapıyorlar')],
      ] } },
      { p: `만드는 법: 어간 + (4형 모음) + yor + 인칭. 어간이 a/e로 끝나면 그 모음이 바뀌어요: ${t('bekle → bekliyor')}, ${t('başla → başlıyor')}. 불규칙: ${t('ye → yiyor')}, ${t('de → diyor')}, ${t('git → gidiyor')}, ${t('et → ediyor')}` },
      { h: '부정과 질문' },
      { ex: [
        ['Gelmiyorum.', '안 가요.', 'gel-mi-yor-um'],
        ['Geliyor musun?', '와?', 'geliyor + mu-sun'],
        ['Anlamıyorum.', '이해가 안 돼요.', 'anla-mı-yor-um'],
      ] },
      { tip: '한국어도 "지금 가고 있어"와 "내일 가"를 현재형으로 말하죠? -iyor도 가까운 미래에 써요: Yarın geliyorum(내일 와요).' },
      { drill: 'conj', label: '동사 활용 드릴' },
    ],
  },
  {
    id: 'past', title: '과거 -dı', sub: '"-았/었다"',
    sections: [
      { table: { head: ['', 'gelmek', 'yapmak', 'okumak'], rows: [
        ['ben', t('geldim'), t('yaptım'), t('okudum')],
        ['sen', t('geldin'), t('yaptın'), t('okudun')],
        ['o', t('geldi'), t('yaptı'), t('okudu')],
        ['biz', t('geldik'), t('yaptık'), t('okuduk')],
        ['siz', t('geldiniz'), t('yaptınız'), t('okudunuz')],
        ['onlar', t('geldiler'), t('yaptılar'), t('okudular')],
      ] } },
      { p: '어간 + dı(4형, 무성음 뒤엔 tı) + 짧은 인칭어미(-m, -n, –, -k, -nız, -lar).' },
      { ex: [
        ['Dün sinemaya gittim.', '어제 영화관에 갔어요.', 'git-ti-m'],
        ['Kahvaltı yaptın mı?', '아침 먹었어?', ''],
        ["Hiç Türkiye'ye gitmedim.", '튀르키예에 한 번도 안 가 봤어요.', 'git-me-di-m'],
      ] },
      { tip: '\'-았/었-\'처럼 동사 바로 뒤에 붙고, 그 뒤에 인칭이 와요: gel-di-m = 오-았-(나) → 왔어요.' },
      { warn: `질문 mi는 인칭어미 뒤: ${t('geldin mi?')} (×geldi misin?). 들은 이야기는 -mış: ${t('geldi')}(왔다, 직접 봄) / ${t('gelmiş')}(왔대, 들음)` },
      { drill: 'conj', label: '동사 활용 드릴' },
    ],
  },
  {
    id: 'time', title: '시간 말하기', sub: '요일 · 날짜 · 시각',
    sections: [
      { h: '요일' },
      { table: { head: ['월', '화', '수', '목', '금', '토', '일'], rows: [
        [t('pazartesi'), t('salı'), t('çarşamba'), t('perşembe'), t('cuma'), t('cumartesi'), t('pazar')],
      ] } },
      { h: '날짜' },
      { p: `일 + 월 순서예요: ${t('2 Ekim')}(10월 2일), ${t('15 Mayıs 2026')}. "~월에" = ${t('mayısta')}` },
      { h: '시각' },
      { table: { head: ['시각', '표현', '직역'], rows: [
        ['3:00', t('Saat üç.'), '3시'],
        ['3:30', t('Saat üç buçuk.'), '3시 반'],
        ['3:15', t('Saat üçü çeyrek geçiyor.'), '3을 15분 지나고 있다'],
        ['3:10', t('Saat üçü on geçiyor.'), '3을 10분 지나고 있다'],
        ['3:45', t('Saat dörde çeyrek var.'), '4에 15분 남았다'],
        ['3:50', t('Saat dörde on var.'), '4에 10분 남았다'],
      ] } },
      { p: `"몇 시에?" = ${t('Saat kaçta?')} → ${t('Saat üçte.')}(3시에)` },
      { warn: `geçiyor 앞의 시는 목적격(${t('üçü, dördü, beşi, altıyı')}), var 앞은 여격(${t('üçe, dörde, beşe, altıya')}).` },
      { tip: `디지털 방식도 자연스러워요: 15.45 = ${t('on beş kırk beş')}. 기차·비행기 시간은 대부분 이렇게 말해요.` },
    ],
  },
];

export const NOTES = [...NOTES1, ...NOTES2];
export const NOTE = new Map(NOTES.map((n) => [n.id, n]));
