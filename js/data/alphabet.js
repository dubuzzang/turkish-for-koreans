// 튀르키예어 알파벳 29자 — 한국어 화자 기준 설명
// say: TTS로 읽을 글자 이름, ko: 가까운 한국어 소리, tip: 한국인 포인트, special: 한국인이 특히 주의할 글자

export const LETTERS = [
  { up: 'A', lo: 'a', say: 'a', ko: 'ㅏ', ipa: 'a', ex: [['araba', '자동차'], ['ana', '어머니']], tip: '한국어 "아"와 거의 같아요.' },
  { up: 'B', lo: 'b', say: 'be', ko: 'ㅂ', ipa: 'b', ex: [['baba', '아빠'], ['bal', '꿀']], tip: '목을 울리는 [b]. 단어 첫머리에서도 한국어 "ㅂ"보다 부드럽고 탁하게.' },
  { up: 'C', lo: 'c', say: 'ce', ko: 'ㅈ', ipa: 'dʒ', ex: [['cami', '모스크'], ['ceket', '재킷']], tip: '영어 C처럼 "ㅋ/ㅅ"으로 읽지 마세요! 영어 j(jam)처럼 "ㅈ" 소리예요.', special: true },
  { up: 'Ç', lo: 'ç', say: 'çe', ko: 'ㅊ', ipa: 'tʃ', ex: [['çay', '차'], ['çocuk', '아이']], tip: '한국어 "ㅊ"과 거의 같아요. 꼬리(세디유)가 붙은 C예요.', special: true },
  { up: 'D', lo: 'd', say: 'de', ko: 'ㄷ', ipa: 'd', ex: [['deniz', '바다'], ['dil', '언어']], tip: '목을 울리는 [d].' },
  { up: 'E', lo: 'e', say: 'e', ko: 'ㅔ', ipa: 'e', ex: [['ev', '집'], ['el', '손']], tip: '"에". 일부 단어에서는 "애"처럼 조금 더 벌어져요.' },
  { up: 'F', lo: 'f', say: 'fe', ko: 'ㅍ(f)', ipa: 'f', ex: [['fil', '코끼리'], ['fiyat', '가격']], tip: '윗니를 아랫입술에 대고 바람을 내보내요. p(ㅍ)와 다른 소리! fil(코끼리) ≠ pil(건전지)', special: true },
  { up: 'G', lo: 'g', say: 'ge', ko: 'ㄱ', ipa: 'g', ex: [['göz', '눈'], ['gül', '장미']], tip: '목을 울리는 [g].' },
  { up: 'Ğ', lo: 'ğ', say: 'yumuşak ge', ko: '(무음)', ipa: 'ː', ex: [['dağ', '산'], ['değil', '아니다']], tip: '"부드러운 g". 소리가 거의 없고 앞 모음을 길게 늘여요: dağ [다ː]. 모음 사이에선 살짝 이어 주기만: değil [데일]. 절대 "ㄱ"으로 읽지 마세요!', special: true },
  { up: 'H', lo: 'h', say: 'he', ko: 'ㅎ', ipa: 'h', ex: [['hava', '날씨'], ['kahve', '커피']], tip: '자음 앞이나 단어 끝에서도 분명히 소리 내요: kahve [카흐베].' },
  { up: 'I', lo: 'ı', say: 'ı', ko: 'ㅡ', ipa: 'ɯ', ex: [['kız', '여자아이'], ['altı', '6']], tip: '점 없는 ı는 한국어 "으"와 거의 같아요 — 한국인에게 아주 쉬운 소리! 대문자는 점 없는 I.', special: true },
  { up: 'İ', lo: 'i', say: 'i', ko: 'ㅣ', ipa: 'i', ex: [['iki', '2'], ['ilk', '첫']], tip: '"이". 대문자에도 점이 있어요: İstanbul, İzmir.', special: true },
  { up: 'J', lo: 'j', say: 'je', ko: 'ㅈ(zh)', ipa: 'ʒ', ex: [['jeton', '토큰'], ['garaj', '차고']], tip: '프랑스어 j처럼 혀를 떼지 않고 마찰하는 "쥐" 소리. 외래어에만 나와요.' },
  { up: 'K', lo: 'k', say: 'ke', ko: 'ㅋ', ipa: 'k', ex: [['kedi', '고양이'], ['kitap', '책']], tip: '"ㅋ"보다 바람을 약하게.' },
  { up: 'L', lo: 'l', say: 'le', ko: 'ㄹ', ipa: 'l', ex: [['limon', '레몬'], ['el', '손']], tip: '모음 사이에서는 "ㄹㄹ"처럼 혀를 붙여요: güle güle [귈레 귈레].' },
  { up: 'M', lo: 'm', say: 'me', ko: 'ㅁ', ipa: 'm', ex: [['masa', '책상'], ['anne', '엄마']], tip: '한국어 "ㅁ"과 같아요.' },
  { up: 'N', lo: 'n', say: 'ne', ko: 'ㄴ', ipa: 'n', ex: [['ne', '무엇'], ['on', '10']], tip: 'k·g 앞에서는 "ㅇ"처럼: Ankara [앙카라].' },
  { up: 'O', lo: 'o', say: 'o', ko: 'ㅗ', ipa: 'o', ex: [['okul', '학교'], ['otobüs', '버스']], tip: '"오".' },
  { up: 'Ö', lo: 'ö', say: 'ö', ko: 'ㅚ', ipa: 'ø', ex: [['göz', '눈'], ['ördek', '오리']], tip: '입술을 "오"처럼 둥글게 하고 "에"라고 말해요. "오-에"로 미끄러지지 말고 한 소리로! 한국어 단모음 "외"와 같아요.', special: true },
  { up: 'P', lo: 'p', say: 'pe', ko: 'ㅍ', ipa: 'p', ex: [['para', '돈'], ['pide', '피데']], tip: '"ㅍ". f와 구분하세요.' },
  { up: 'R', lo: 'r', say: 're', ko: 'ㄹ', ipa: 'ɾ', ex: [['renk', '색'], ['bir', '1']], tip: '혀끝을 한 번 튕겨요. 단어 끝 r은 바람 섞인 소리가 나기도 해요: bir [비르].' },
  { up: 'S', lo: 's', say: 'se', ko: 'ㅅ(ㅆ)', ipa: 's', ex: [['su', '물'], ['ses', '소리']], tip: '항상 [s]. si는 한국어 "시"([ɕi])가 아니라 혀끝 "씨"에 가깝게 — 안 그러면 ş처럼 들려요!', special: true },
  { up: 'Ş', lo: 'ş', say: 'şe', ko: '쉬(sh)', ipa: 'ʃ', ex: [['şeker', '설탕'], ['şehir', '도시']], tip: '영어 sh. 입술을 살짝 내밀어요. s와 구분: sen(너) ≠ şen(명랑한)', special: true },
  { up: 'T', lo: 't', say: 'te', ko: 'ㅌ', ipa: 't', ex: [['tuz', '소금'], ['tatlı', '디저트']], tip: '"ㅌ". 단어 끝에서도 터뜨려 발음해요: et [에트에 가깝게].' },
  { up: 'U', lo: 'u', say: 'u', ko: 'ㅜ', ipa: 'u', ex: [['uçak', '비행기'], ['su', '물']], tip: '"우".' },
  { up: 'Ü', lo: 'ü', say: 'ü', ko: 'ㅟ', ipa: 'y', ex: [['üç', '3'], ['süt', '우유']], tip: '입술을 "우"처럼 둥글게 하고 "이"라고 말해요. 처음부터 끝까지 같은 입 모양 — 한국어 단모음 "위"예요.', special: true },
  { up: 'V', lo: 'v', say: 've', ko: 'ㅂ(v)', ipa: 'v', ex: [['ve', '그리고'], ['ev', '집']], tip: '윗니를 아랫입술에 대고 목을 울려요. b(ㅂ)가 아니에요! var(있다) ≠ bar(바)', special: true },
  { up: 'Y', lo: 'y', say: 'ye', ko: '이(y)', ipa: 'j', ex: [['yol', '길'], ['ay', '달']], tip: '모음 앞에서는 "야·예·요·유"의 y, 모음 뒤에서는 "이": çay [차이].' },
  { up: 'Z', lo: 'z', say: 'ze', ko: 'ㅈ(z)', ipa: 'z', ex: [['zaman', '시간'], ['deniz', '바다']], tip: '영어 z처럼 "ㅅ"을 목 울려 내는 소리. c(ㅈ)와 달라요: zam(가격 인상) ≠ cam(유리)', special: true },
];

// 한국인이 헷갈리는 소리 — 최소대립쌍 듣기 훈련
export const PAIRS = [
  { id: 'fp', title: 'f ↔ p', desc: 'f는 윗니로 아랫입술을 살짝 물고, p는 두 입술을 터뜨려요.', pairs: [['fil', '코끼리', 'pil', '건전지'], ['fark', '차이', 'park', '공원'], ['fiş', '영수증', 'piş', '익어라']] },
  { id: 'vb', title: 'v ↔ b', desc: 'v는 윗니+아랫입술 마찰, b는 두 입술. 한국어 ㅂ으로 둘 다 발음하면 구분이 안 돼요.', pairs: [['var', '있다', 'bar', '바(술집)'], ['veri', '데이터', 'beri', '~이래로'], ['vay', '와!(감탄)', 'bay', '~씨(남성)']] },
  { id: 'zc', title: 'z ↔ c', desc: 'z는 [z](목 울리는 ㅅ), c는 [dʒ](ㅈ). 둘 다 "ㅈ"으로 읽기 쉬워요.', pairs: [['zam', '가격 인상', 'cam', '유리'], ['zan', '추측', 'can', '목숨, 영혼']] },
  { id: 'ss', title: 's ↔ ş', desc: 's는 혀끝 [s], ş는 영어 sh. 한국어 "시"는 ş처럼 들릴 수 있어요.', pairs: [['sen', '너', 'şen', '명랑한'], ['kas', '근육', 'kaş', '눈썹'], ['sis', '안개', 'şiş', '꼬치']] },
  { id: 'ii', title: 'ı ↔ i', desc: 'ı는 "으", i는 "이". 점 하나로 뜻이 바뀌어요!', pairs: [['kır', '들판', 'kir', '때(더러움)'], ['dış', '밖', 'diş', '이(치아)'], ['kıl', '털', 'kil', '찰흙']] },
  { id: 'oo', title: 'o ↔ ö', desc: 'ö는 입술을 둥글게 한 "에"(한국어 단모음 외).', pairs: [['gol', '골(축구)', 'göl', '호수'], ['kor', '잉걸불', 'kör', '눈먼'], ['on', '10', 'ön', '앞']] },
  { id: 'uu', title: 'u ↔ ü', desc: 'ü는 입술을 둥글게 한 "이"(한국어 단모음 위).', pairs: [['uç', '끝', 'üç', '3'], ['kul', '종', 'kül', '재'], ['sus', '조용히 해', 'süs', '장식']] },
  { id: 'rl', title: 'r ↔ l', desc: 'r은 혀를 한 번 튕기고, l은 혀끝을 윗잇몸에 붙인 채 소리 내요.', pairs: [['kar', '눈(雪)', 'kal', '머물러'], ['bir', '1', 'bil', '알아라'], ['dar', '좁은', 'dal', '나뭇가지']] },
];

// 발음 규칙 요약 (알파벳 화면 하단)
export const SOUND_RULES = [
  { title: '쓰는 대로 읽어요', body: '튀르키예어는 글자 하나가 소리 하나예요. 철자만 알면 처음 보는 단어도 읽을 수 있어요 — 한글처럼요!' },
  { title: '강세는 보통 마지막 음절', body: 'kitap → ki-<b>TAP</b>, kitaplar → kitap-<b>LAR</b>. 단, 지명(<b>AN</b>kara, İs<b>TAN</b>bul)이나 일부 단어는 예외예요.' },
  { title: '끝 자음은 터뜨려요', body: '한국어 받침처럼 막지 말고 살짝 터뜨려요: kitap [키타프], et [에트]. 반대로 "으"를 크게 붙이지는 마세요.' },
  { title: 'ğ는 소리 내지 않아요', body: '앞 모음을 길게 하거나(dağ [다ː]), 모음 사이를 부드럽게 이어 줘요(değil [데일]).' },
  { title: 'â, î, û', body: '외래어에서 앞 자음을 부드럽게 하거나 모음을 길게 하는 표시예요: kâr(이익) / kar(눈). 입력할 때는 a, i, u로 써도 괜찮아요.' },
  { title: 'Q, W, X는 없어요', body: '대신 k, v, ks를 써요: taksi(택시), vagon, ekspres.' },
];
