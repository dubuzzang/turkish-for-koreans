// 커리큘럼: 단원 → 레슨. 각 레슨 = 새 단어 + 한국인 맞춤 팁 + 문법 확인 문제 + 문장 연습
// items: 문법 확인(객관식) — a는 정답 인덱스(화면에서는 섞어서 보여줌)

const b = (s) => `<b class="tr">${s}</b>`;

export const UNITS = [
  {
    id: 'u1', no: 1, title: '첫 만남', tr: 'Tanışma', color: '#0e9f9a',
    desc: '인사, 안부, 자기소개, 예의 표현',
    lessons: [
      {
        id: 'u1l1', title: '인사하기', tr: 'Merhaba!',
        words: ['merhaba', 'selam', 'gunaydin', 'iyi_aksamlar', 'iyi_geceler', 'hosca_kal', 'gule_gule', 'gorusuruz'],
        tip: {
          title: '떠날 때와 보낼 때가 달라요',
          html: `떠나는 사람은 ${b('Hoşça kal')}(잘 있어), 남는 사람은 ${b('Güle güle')}(잘 가)라고 해요. 한국어 '안녕히 계세요 / 안녕히 가세요'와 똑같은 구분이죠!<br><br>${b('Merhaba')}는 언제든 쓰는 '안녕하세요', ${b('Selam')}은 친구끼리 '안녕'이에요.`,
        },
        items: [
          { q: '친구 집을 나서며 친구에게 하는 인사는?', opts: ['Hoşça kal!', 'Güle güle!', 'Günaydın!'], a: 0, why: '떠나는 사람은 Hoşça kal(잘 있어).' },
          { q: '손님을 배웅하며 하는 인사는?', opts: ['Güle güle!', 'Hoşça kal!', 'İyi akşamlar!'], a: 0, why: '남는 사람은 Güle güle(잘 가) — "웃으며 가세요"라는 뜻이에요.' },
          { q: '아침 9시, 동료에게 건네는 첫인사', opts: ['Günaydın!', 'İyi geceler!', 'Güle güle!'], a: 0, why: 'Günaydın = gün(날) + aydın(밝은) → 좋은 아침!' },
        ],
        sents: [
          ['Selam, günaydın!', '안녕, 좋은 아침!'],
          ['Merhaba, iyi akşamlar!', '안녕하세요, 좋은 저녁이에요!'],
          ['İyi geceler, görüşürüz!', '잘 자, 또 봐!'],
          ['Hoşça kal, görüşürüz!', '잘 있어, 또 봐!'],
          ['Güle güle, görüşürüz!', '잘 가, 또 봐!'],
        ],
      },
      {
        id: 'u1l2', title: '안부 묻기', tr: 'Nasılsın?',
        words: ['nasilsin', 'nasilsiniz', 'iyiyim', 'tesekkurler', 'sen', 'siz', 'fena_degil', 'cok_iyi', 'ne_haber'],
        tip: {
          title: 'sen과 siz — 반말과 존댓말',
          html: `${b('sen')}은 반말 '너', ${b('siz')}는 존댓말 '당신'(그리고 복수 '너희')이에요. 처음 만난 어른·손님·점원에게는 siz! 동사 끝도 함께 바뀌어요.<br><br>${b('Nasılsın?')} 어떻게 지내?<br>${b('Nasılsınız?')} 어떻게 지내세요?<br><br>한국어에서 '-니?'와 '-세요?'를 고르는 것과 같은 감각이에요.`,
        },
        items: [
          { q: '처음 만난 할머니께 "어떻게 지내세요?"', opts: ['Nasılsınız?', 'Nasılsın?', 'Ne haber?'], a: 0, why: '어른께는 존댓말 siz → Nasılsınız?' },
          { q: '친구가 "Nasılsın?" 하고 물었어요. "잘 지내, 고마워!"', opts: ['İyiyim, teşekkürler!', 'Güle güle!', 'Günaydın!'], a: 0, why: 'İyiyim = 나는 좋다(잘 지낸다).' },
          { q: '친구에게 "너는?" 하고 되물을 때', opts: ['Sen?', 'Siz?', 'Ben?'], a: 0, why: '친구에게는 sen(너).' },
        ],
        sents: [
          ['Merhaba, nasılsın?', '안녕, 어떻게 지내?'],
          ['İyiyim, teşekkürler.', '잘 지내, 고마워.'],
          ['Sen nasılsın?', '너는 어떻게 지내?'],
          ['Günaydın, nasılsınız?', '안녕하세요, 어떻게 지내세요?'],
          ['Çok iyiyim, teşekkürler.', '아주 잘 지내요, 고마워요.'],
          ['Fena değil, sen?', '나쁘지 않아, 너는?'],
          ['Selam, ne haber?', '안녕, 별일 없어?'],
        ],
      },
      {
        id: 'u1l3', title: '자기소개', tr: 'Benim adım…',
        words: ['ben', 'benim', 'ad', 'ne', 'memnun_oldum', 'koreli', 'ogrenci', 'de'],
        tip: {
          title: '이름과 국적 말하기',
          html: `${b('Benim adım Mina.')} = 제 이름은 미나예요.<br>ben-im(나의) + ad-ım(이름-내) — '내'가 두 번 표시돼요. 그래서 ${b('Adım Mina.')}라고 줄여도 돼요. 한국어에서 '제 이름은'의 '제'를 빼고 말하는 것과 비슷하죠.<br><br>${b('Ben Koreliyim.')} = 저는 한국 사람이에요. 끝의 <b>-yim</b>이 '(나는) ~이에요'예요.`,
        },
        items: [
          { q: '"제 이름은 지수예요"', opts: ['Benim adım Jisu.', 'Benim Jisu adım.', 'Adım benim Jisu.'], a: 0, why: '나의(benim) + 이름-내(adım) + 지수. 한국어 어순과 같아요!' },
          { q: 'Ben öğrenci___.', ko: '저는 학생이에요.', opts: ['yim', 'sin', 'yiz'], a: 0, why: 'ben(나) → -(y)im. 모음 i로 끝나서 y를 넣어요.' },
          { q: '"저도 반가워요"', opts: ['Ben de memnun oldum.', 'Ben memnun de oldum.', 'De ben memnun oldum.'], a: 0, why: 'de(도)는 한국어 "도"처럼 앞말 바로 뒤에 와요(띄어 씀): Ben de = 저도.' },
        ],
        sents: [
          ['Benim adım Mina.', '제 이름은 미나예요.'],
          ['Adın ne?', '네 이름은 뭐야?'],
          ['Ben Koreliyim.', '저는 한국 사람이에요.'],
          ['Ben öğrenciyim.', '저는 학생이에요.'],
          ['Memnun oldum.', '만나서 반가워요.'],
          ['Ben de memnun oldum.', '저도 반가워요.'],
          ['Ben de Koreliyim.', '저도 한국 사람이에요.'],
        ],
      },
      {
        id: 'u1l4', title: '예의 표현', tr: 'Lütfen',
        words: ['lutfen', 'tesekkur_ederim', 'rica_ederim', 'ozur_dilerim', 'affedersiniz', 'evet', 'hayir', 'tamam'],
        tip: {
          title: '고마움, 사과, 부탁',
          html: `${b('Teşekkür ederim')}(감사합니다)은 정중하게, ${b('Teşekkürler')}(고마워요)는 가볍게. 대답은 ${b('Rica ederim')}(천만에요).<br><br>길을 물을 때는 ${b('Affedersiniz')}(실례합니다)로 시작하세요. 부탁할 땐 끝에 ${b('lütfen')}만 붙이면 '~ 주세요'가 돼요: ${b('Su, lütfen.')} 물 주세요.`,
        },
        items: [
          { q: '"고마워요"에 대한 대답은?', opts: ['Rica ederim.', 'Özür dilerim.', 'Afiyet olsun.'], a: 0, why: 'Rica ederim = 천만에요.' },
          { q: '모르는 사람에게 길을 물을 때 첫마디', opts: ['Affedersiniz…', 'Güle güle…', 'Tamam…'], a: 0, why: 'Affedersiniz = 실례합니다(용서해 주세요).' },
          { q: '"물 주세요"', opts: ['Su, lütfen.', 'Lütfen su var.', 'Su tamam.'], a: 0, why: '명사 + lütfen = ~ 주세요.' },
        ],
        sents: [
          ['Evet, teşekkür ederim.', '네, 감사합니다.'],
          ['Hayır, teşekkürler.', '아니요, 괜찮아요(고마워요).'],
          ['Tamam, teşekkürler!', '좋아요, 고마워요!'],
          ['Rica ederim.', '천만에요.'],
          ['Özür dilerim!', '죄송합니다!'],
          ['Evet, tamam.', '네, 좋아요.'],
          ['Su, lütfen.', '물 주세요.'],
        ],
      },
    ],
  },
  {
    id: 'u2', no: 2, title: '나와 가족', tr: 'Ben ve ailem', color: '#7356f0',
    desc: '"~이에요" 접미사, 모음조화, 의문 첨사 mi, 가족 호칭, 이·그·저',
    lessons: [
      {
        id: 'u2l1', title: '직업 말하기', tr: 'Ben öğretmenim.',
        words: ['ogretmen', 'doktor', 'muhendis', 'asci', 'garson', 'polis', 'hemsire', 'is'],
        tip: {
          title: '모음조화 첫걸음',
          html: `'(나는) ~이에요'의 <b>-(y)ım</b>은 앞 단어의 <b>마지막 모음</b>에 따라 모양이 바뀌어요.<br><br>• öğretm<b>e</b>n → öğretmen<b>im</b><br>• dokt<b>o</b>r → doktor<b>um</b><br>• aşç<b>ı</b> → aşçı<b>yım</b> (모음으로 끝나면 y 추가)<br>• öğrenc<b>i</b> → öğrenci<b>yim</b><br><br>한국어도 '잡<b>아</b> / 먹<b>어</b>'처럼 앞 모음을 보고 어미를 고르죠? 튀르키예어는 이 규칙을 훨씬 철저하게 지켜요.`,
        },
        items: [
          { q: 'Ben doktor___.', ko: '저는 의사예요.', opts: ['um', 'ım', 'im', 'üm'], a: 0, why: '마지막 모음 o → u: doktorum' },
          { q: 'Ben aşçı___.', ko: '저는 요리사예요.', opts: ['yım', 'yim', 'ım'], a: 0, why: '마지막 모음 ı → ı, 모음으로 끝나니 y를 넣어요: aşçıyım' },
          { q: 'Ben öğretmen___.', ko: '저는 선생님이에요.', opts: ['im', 'ım', 'um'], a: 0, why: '마지막 모음 e → i: öğretmenim' },
          { q: 'Sen polis___.', ko: '너는 경찰이구나.', opts: ['sin', 'sın', 'sun'], a: 0, why: 'sen(너) → -sin. 마지막 모음 i → i: polissin' },
          { q: 'Biz garson___.', ko: '우리는 웨이터예요.', opts: ['uz', 'ız', 'iz'], a: 0, why: 'biz(우리) → -(y)iz. 마지막 모음 o → u: garsonuz' },
        ],
        sents: [
          ['Ben öğretmenim.', '저는 선생님이에요.'],
          ['Sen doktorsun.', '너는 의사구나.'],
          ['O bir mühendis.', '그는 엔지니어예요.'],
          ['Biz öğrenciyiz.', '우리는 학생이에요.'],
          ['Ali bir aşçı.', '알리는 요리사예요.'],
          ['Ne iş yapıyorsunuz?', '무슨 일을 하세요?'],
        ],
      },
      {
        id: 'u2l2', title: '국적과 언어', tr: 'Nerelisin?',
        words: ['kore', 'turkiye', 'turkce', 'korece', 'ingilizce', 'nereli', 'ulke', 'mi'],
        tip: {
          title: '의문 첨사 mi = "~니? / ~까?"',
          html: `예·아니요 질문은 끝에 ${b('mi')}를 띄어 쓰면 돼요. 한국어 '-니? / -까?'처럼요. mi도 모음조화로 <b>mı / mi / mu / mü</b>가 돼요.<br><br>• Koreli ${b('misin')}? 한국 사람이야?<br>• Türk ${b('müsün')}? 튀르키예 사람이야?<br>• Doktor ${b('musunuz')}? 의사세요?<br><br>억양은 mi 바로 앞 음절을 올려요.`,
        },
        items: [
          { q: 'Sen Türk ___?', ko: '너는 튀르키예 사람이야?', opts: ['müsün', 'misin', 'musun', 'mısın'], a: 0, why: 'Türk의 마지막 모음 ü → mü + sün' },
          { q: 'Siz Koreli ___?', ko: '한국 분이세요?', opts: ['misiniz', 'mısınız', 'musunuz'], a: 0, why: 'Koreli의 마지막 모음 i → mi + siniz' },
          { q: 'Bu kahve ___?', ko: '이거 커피예요?', opts: ['mi', 'mı', 'mu'], a: 0, why: 'kahve의 마지막 모음 e → mi' },
        ],
        sents: [
          ['Nerelisin?', '어디 출신이야?'],
          ['Ben Koreliyim.', '저는 한국 사람이에요.'],
          ['Sen Türk müsün?', '너는 튀르키예 사람이야?'],
          ['Evet, İstanbulluyum.', '응, 나는 이스탄불 사람이야.'],
          ['Türkçe biliyor musun?', '튀르키예어 할 줄 알아?'],
          ['Biraz Türkçe biliyorum.', '튀르키예어 조금 해요.'],
          ['İngilizce konuşuyor musunuz?', '영어 하세요?'],
          ['Kore güzel bir ülke.', '한국은 아름다운 나라예요.'],
        ],
      },
      {
        id: 'u2l3', title: '가족', tr: 'Ailem',
        words: ['aile', 'anne', 'baba', 'kardes', 'abla', 'abi', 'dede', 'anneanne', 'babaanne'],
        tip: {
          title: '한국어처럼 세밀한 가족 호칭',
          html: `튀르키예어도 손위 형제를 따로 불러요: ${b('abla')}(언니·누나), ${b('abi')}(오빠·형).<br>할머니도 ${b('anneanne')}(엄마의 엄마 = 외할머니)와 ${b('babaanne')}(아빠의 엄마 = 친할머니)로 구분하고, 이모(${b('teyze')})·고모(${b('hala')})·외삼촌(${b('dayı')})·삼촌(${b('amca')})까지 한국어와 거의 1:1이에요!<br><br>${b('annem')} = 우리 엄마 (anne + -m '나의')`,
        },
        items: [
          { q: '엄마의 엄마는?', opts: ['anneanne', 'babaanne', 'teyze'], a: 0, why: 'anne(엄마) + anne(엄마) = 외할머니' },
          { q: '남동생이 형을 부를 때', opts: ['abi', 'abla', 'amca'], a: 0, why: 'abi = 오빠·형 (손위 남자 형제)' },
          { q: '"우리 엄마"', opts: ['annem', 'anne', 'annen'], a: 0, why: '-m = 나의. annem = 내 엄마 → 우리 엄마' },
        ],
        sents: [
          ['Annem öğretmen.', '우리 엄마는 선생님이에요.'],
          ['Babam doktor.', '우리 아빠는 의사예요.'],
          ['Ablam öğrenci.', '우리 언니(누나)는 학생이에요.'],
          ['Abim mühendis.', '우리 오빠(형)는 엔지니어예요.'],
          ['İki kardeşim var.', '저는 형제가 둘 있어요.'],
          ['Dedem çok iyi.', '우리 할아버지는 아주 좋으세요.'],
        ],
      },
      {
        id: 'u2l4', title: '이건 뭐예요?', tr: 'Bu ne?',
        words: ['bu', 'su_that', 'o', 'kim', 'bir', 'kitap', 'kalem', 'canta', 'telefon'],
        tip: {
          title: 'bu · şu · o = 이 · 그 · 저',
          html: `튀르키예어 지시어도 한국어처럼 3단계예요.<br>• ${b('bu')} 이(것) — 가까이<br>• ${b('şu')} 그(것) — 가리키며, 조금 떨어진<br>• ${b('o')} 저(것) — 멀리 (그리고 '그 사람')<br><br>${b('Bu ne?')} 이건 뭐야? / ${b('Bu kim?')} 이 사람은 누구야?<br>3인칭에서는 '~이다'가 생략돼요: ${b('Bu bir kitap.')} 이건 책이야.`,
        },
        items: [
          { q: '"이건 뭐예요?"', opts: ['Bu ne?', 'Ne bu mi?', 'Bu kim?'], a: 0, why: 'bu(이것) + ne(무엇). 한국어 어순 그대로!' },
          { q: '멀리 있는 사람을 보며 "저 사람은 누구야?"', opts: ['O kim?', 'Bu ne?', 'Şu ne?'], a: 0, why: 'o = 저(멀리), kim = 누구' },
          { q: '"이건 책이에요"', opts: ['Bu bir kitap.', 'Bu kitap bir mi.', 'Kitap bu bir.'], a: 0, why: 'bir는 영어 a처럼 명사 앞에 와요.' },
        ],
        sents: [
          ['Bu ne?', '이건 뭐예요?'],
          ['Bu bir kitap.', '이건 책이에요.'],
          ['Şu ne?', '그건 뭐예요?'],
          ['O bir telefon.', '저건 전화기예요.'],
          ['Bu kim?', '이 사람은 누구예요?'],
          ['Bu benim çantam.', '이건 제 가방이에요.'],
          ['Bu kalem senin mi?', '이 펜 네 거야?'],
        ],
      },
    ],
  },
  {
    id: 'u3', no: 3, title: '있다·없다, 어디에', tr: 'Var mı?', color: '#2b72e8',
    desc: 'var/yok, 장소격 -da(에/에서), 위치 표현, 복수 -lar',
    lessons: [
      {
        id: 'u3l1', title: '있어요? 없어요?', tr: 'Var mı?',
        words: ['var', 'yok', 'su', 'ekmek', 'para', 'zaman', 'soru'],
        tip: {
          title: 'var = 있다, yok = 없다',
          html: `${b('Su var.')} 물이 있어요. / ${b('Su yok.')} 물이 없어요.<br>${b('Su var mı?')} 물 있어요?<br><br>어순이 한국어와 똑같죠! 소유도 var로 말해요:<br>${b('Param var.')} = 나의 돈이 있다 → 나는 돈이 있어요. (para + -m '나의')`,
        },
        items: [
          { q: '"빵 있어요?"', opts: ['Ekmek var mı?', 'Var ekmek mi?', 'Ekmek mı var?'], a: 0, why: '명사 + var + mı? (var의 모음 a → mı)' },
          { q: '"시간이 없어요"', opts: ['Zamanım yok.', 'Zaman yok mu.', 'Yok zamanım.'], a: 0, why: 'zaman-ım(나의 시간) + yok(없다)' },
          { q: '"질문이 하나 있어요"', opts: ['Bir sorum var.', 'Bir soru yok.', 'Var bir sorum.'], a: 0, why: 'soru-m(나의 질문) + var' },
        ],
        sents: [
          ['Su var mı?', '물 있어요?'],
          ['Evet, su var.', '네, 물 있어요.'],
          ['Çay yok.', '차가 없어요.'],
          ['Ekmek var mı?', '빵 있어요?'],
          ['Hayır, ekmek yok.', '아니요, 빵 없어요.'],
          ['Param yok.', '돈이 없어요.'],
          ['Bir sorum var.', '질문이 하나 있어요.'],
          ['Zamanın var mı?', '시간 있어?'],
        ],
      },
      {
        id: 'u3l2', title: '어디에 있어요?', tr: 'Nerede?',
        words: ['ev', 'okul', 'otel', 'oda', 'nerede', 'burada', 'orada', 'istanbul'],
        tip: {
          title: '장소격 -da/-de = "~에(서)"',
          html: `${b('ev')}(집) → ${b('evde')}(집에) / ${b('okul')}(학교) → ${b('okulda')}(학교에)<br>마지막 모음이 a·ı·o·u면 <b>-da</b>, e·i·ö·ü면 <b>-de</b>.<br><br>마지막 소리가 <b>p ç t k f s ş h</b>(무성음)면 d가 t로 바뀌어요: ${b('kitapta')}, ${b('işte')}.<br>외우는 주문: <b>Fıstıkçı Şahap</b>(땅콩장수 샤합) — 이 말에 든 자음이 바로 무성음 8개예요!<br><br>고유명사는 아포스트로피로 구분: ${b("İstanbul'da")}`,
        },
        items: [
          { q: 'ev + 에(장소)', opts: ['evde', 'evda', 'evte'], a: 0, why: '마지막 모음 e → -de, v는 유성음이라 d 그대로' },
          { q: 'okul + 에(장소)', opts: ['okulda', 'okulde', 'okulta'], a: 0, why: '마지막 모음 u → -da' },
          { q: 'kitap + 에(장소)', opts: ['kitapta', 'kitapda', 'kitapte'], a: 0, why: 'p는 무성음(Fıstıkçı Şahap) → d가 t로: -ta' },
          { q: 'iş(직장) + 에', opts: ['işte', 'işde', 'işta'], a: 0, why: 'ş는 무성음 → t, 마지막 모음 i → e: işte' },
          { q: '"저는 집에 있어요"', opts: ['Ben evdeyim.', 'Ben evim.', 'Ben eve.'], a: 0, why: 'ev-de(집에) + -yim(나는 ~이다). "있다"를 따로 쓰지 않아요!' },
        ],
        sents: [
          ['Ben evdeyim.', '저는 집에 있어요.'],
          ['Annem işte.', '엄마는 직장에 계세요.'],
          ['Otel nerede?', '호텔이 어디에 있어요?'],
          ['Ali okulda mı?', '알리는 학교에 있어요?'],
          ['Hayır, Ali evde.', '아니요, 알리는 집에 있어요.'],
          ["Biz İstanbul'dayız.", '우리는 이스탄불에 있어요.'],
          ['Oda burada.', '방은 여기예요.'],
          ['Telefonum orada.', '내 휴대폰은 저기 있어.'],
        ],
      },
      {
        id: 'u3l3', title: '위치 표현', tr: 'Masanın üstünde',
        words: ['masa', 'sandalye', 'ust', 'alt', 'ic', 'yan', 'on_front', 'arka'],
        tip: {
          title: '"책상(의) 위에" = masanın üstünde',
          html: `위치 표현은 한국어와 순서가 같아요!<br>${b('masa-nın')} (책상-의) + ${b('üst-ü-nde')} (위-에)<br><br>• üstünde 위에 · altında 아래에 · içinde 안에<br>• yanında 옆에 · önünde 앞에 · arkasında 뒤에<br><br>지금은 덩어리째 익히세요. 속격 -nın(의)은 뒤 단원에서 자세히 배워요.`,
        },
        items: [
          { q: '"책상 위에"', opts: ['masanın üstünde', 'üstünde masanın', 'masada üst'], a: 0, why: '책상의(masanın) + 위에(üstünde) — 한국어 어순 그대로' },
          { q: '"가방 안에"', opts: ['çantanın içinde', 'çantanın altında', 'çantanın yanında'], a: 0, why: 'iç = 안 → içinde = 안에' },
          { q: '"집 뒤에"', opts: ['evin arkasında', 'evin önünde', 'evin yanında'], a: 0, why: 'arka = 뒤 → arkasında = 뒤에' },
        ],
        sents: [
          ['Kitap masanın üstünde.', '책은 책상 위에 있어요.'],
          ['Çanta sandalyenin altında.', '가방은 의자 아래에 있어요.'],
          ['Telefon çantanın içinde.', '전화기는 가방 안에 있어요.'],
          ['Okul evin yanında.', '학교는 집 옆에 있어요.'],
          ['Taksi otelin önünde.', '택시는 호텔 앞에 있어요.'],
          ['Bahçe evin arkasında.', '정원은 집 뒤에 있어요.'],
        ],
      },
      {
        id: 'u3l4', title: '여럿일 때 -lar/-ler', tr: 'Kediler',
        words: ['cocuk', 'kedi', 'kopek', 'arkadas', 'cok', 'kac', 'iki', 'uc'],
        tip: {
          title: '-lar/-ler = "-들"',
          html: `${b('kedi → kediler')} 고양이들 / ${b('çocuk → çocuklar')} 아이들<br>마지막 모음이 a·ı·o·u면 <b>-lar</b>, e·i·ö·ü면 <b>-ler</b>.<br><br>💡 숫자 뒤에서는 복수를 쓰지 않아요: ${b('iki kedi')}(고양이 두 마리). 한국어도 '고양이들 두 마리'라고 안 하죠? ${b('çok')}(많은) 뒤도 단수: ${b('çok kitap')}(많은 책)`,
        },
        items: [
          { q: 'kedi + 들', opts: ['kediler', 'kedilar', 'kedier'], a: 0, why: '마지막 모음 i → -ler' },
          { q: 'çocuk + 들', opts: ['çocuklar', 'çocukler', 'çocuğlar'], a: 0, why: '마지막 모음 u → -lar (자음 l로 시작하니 k는 그대로)' },
          { q: '"고양이 두 마리"', opts: ['iki kedi', 'iki kediler', 'kediler iki'], a: 0, why: '숫자 뒤엔 단수!' },
        ],
        sents: [
          ['Kediler bahçede.', '고양이들은 정원에 있어요.'],
          ['Çocuklar okulda.', '아이들은 학교에 있어요.'],
          ['İki köpeğim var.', '저는 개가 두 마리 있어요.'],
          ['Kaç kardeşin var?', '형제가 몇 명이야?'],
          ['Üç arkadaşım burada.', '제 친구 세 명이 여기 있어요.'],
          ['Evde çok kitap var.', '집에 책이 많아요.'],
        ],
      },
    ],
  },
  {
    id: 'u4', no: 4, title: '숫자와 쇼핑', tr: 'Sayılar ve alışveriş', color: '#e2700c',
    desc: '숫자 0~1000, 가격 묻기, 흥정, 시장 표현, 목적격 맛보기',
    lessons: [
      {
        id: 'u4l1', title: '숫자 0~10', tr: 'Bir, iki, üç',
        words: ['sifir', 'bir', 'iki', 'uc', 'dort', 'bes', 'alti', 'yedi', 'sekiz', 'dokuz', 'on'],
        tip: {
          title: '숫자는 한자어 수사처럼',
          html: `튀르키예어 숫자는 '일, 이, 삼…'처럼 아주 규칙적이에요. 10까지만 외우면 99까지 조립할 수 있어요!<br><br>0 ${b('sıfır')} · 1 ${b('bir')} · 2 ${b('iki')} · 3 ${b('üç')} · 4 ${b('dört')} · 5 ${b('beş')}<br>6 ${b('altı')} · 7 ${b('yedi')} · 8 ${b('sekiz')} · 9 ${b('dokuz')} · 10 ${b('on')}`,
        },
        items: [
          { q: 'üç + iki = ?', opts: ['beş', 'dört', 'altı'], a: 0, why: '3 + 2 = 5 (beş)' },
          { q: '"일곱"', opts: ['yedi', 'sekiz', 'dokuz'], a: 0, why: '7 = yedi' },
          { q: 'dokuz − dört = ?', opts: ['beş', 'üç', 'altı'], a: 0, why: '9 − 4 = 5 (beş)' },
        ],
        sents: [
          ['Bir, iki, üç!', '하나, 둘, 셋!'],
          ['İki çay, lütfen.', '차 두 잔 주세요.'],
          ['Dört kişiyiz.', '우리는 네 명이에요.'],
          ['Beş dakika, lütfen.', '5분만요.'],
          ['Oda numaranız yedi.', '방 번호는 7번이에요.'],
          ['Üç kardeşim var.', '형제가 셋 있어요.'],
        ],
      },
      {
        id: 'u4l2', title: '10~100', tr: 'Yirmi beş',
        words: ['yirmi', 'otuz', 'kirk', 'elli', 'altmis', 'yetmis', 'seksen', 'doksan', 'yuz_100'],
        tip: {
          title: '십 + 일 = on bir',
          html: `십의 자리와 일의 자리를 그냥 이어 붙여요. 한국어 '이십오'와 같은 방식!<br><br>11 ${b('on bir')} · 25 ${b('yirmi beş')} · 48 ${b('kırk sekiz')} · 99 ${b('doksan dokuz')}<br><br>100은 '일백'이 아니라 그냥 ${b('yüz')}. 200은 ${b('iki yüz')} — 한국어 '백, 이백'과 똑같아요.`,
        },
        items: [
          { q: '25', opts: ['yirmi beş', 'beş yirmi', 'iki beş'], a: 0, why: '20(yirmi) + 5(beş)' },
          { q: '"마흔여덟"', opts: ['kırk sekiz', 'sekiz kırk', 'kırk dokuz'], a: 0, why: '40(kırk) + 8(sekiz)' },
          { q: '100', opts: ['yüz', 'bir yüz', 'on on'], a: 0, why: '백 = yüz (bir 없이!)' },
        ],
        sents: [
          ['Yirmi beş yaşındayım.', '저는 스물다섯 살이에요.'],
          ['Kaç yaşındasın?', '몇 살이야?'],
          ['Otuz lira.', '30리라예요.'],
          ['Dedem yetmiş yaşında.', '할아버지는 일흔 살이세요.'],
          ['Elli iki kişi var.', '52명이 있어요.'],
          ['Doksan dokuz lira.', '99리라예요.'],
        ],
      },
      {
        id: 'u4l3', title: '얼마예요?', tr: 'Ne kadar?',
        words: ['ne_kadar', 'lira', 'para', 'ucuz', 'pahali', 'indirim', 'fiyat', 'bin'],
        tip: {
          title: '가격 묻고 흥정하기',
          html: `${b('Bu ne kadar?')} 이거 얼마예요?<br>${b('Kaç lira?')} 몇 리라예요?<br>${b('Çok pahalı!')} 너무 비싸요!<br>${b('İndirim var mı?')} 할인 돼요?<br><br>시장(çarşı)에서는 흥정이 자연스러워요. 웃으며 ${b('Biraz indirim yapar mısınız?')}(좀 깎아 주실래요?)`,
        },
        items: [
          { q: '"이거 얼마예요?"', opts: ['Bu ne kadar?', 'Bu kaç yaş?', 'Ne bu kadar?'], a: 0, why: 'ne kadar = 얼마나/얼마' },
          { q: '"너무 비싸요!"', opts: ['Çok pahalı!', 'Çok ucuz!', 'Çok güzel!'], a: 0, why: 'pahalı = 비싼 ↔ ucuz = 싼' },
          { q: '1,000리라', opts: ['bin lira', 'bir bin lira', 'on yüz lira'], a: 0, why: '천도 "일천"이 아니라 그냥 bin' },
        ],
        sents: [
          ['Bu ne kadar?', '이거 얼마예요?'],
          ['Yüz lira.', '100리라예요.'],
          ['Çok pahalı!', '너무 비싸요!'],
          ['İndirim var mı?', '할인 돼요?'],
          ['Bu çok ucuz.', '이거 정말 싸요.'],
          ['Fiyatı ne kadar?', '가격이 얼마예요?'],
          ['Bin lira çok para!', '천 리라는 큰돈이에요!'],
        ],
      },
      {
        id: 'u4l4', title: '시장에서', tr: 'Bunu istiyorum',
        words: ['istemek', 'kilo', 'elma', 'domates', 'peynir', 'tane', 'baska', 'hepsi'],
        tip: {
          title: '목적격 -(y)ı = "을/를" (특정할 때만!)',
          html: `${b('Bunu istiyorum.')} 이걸 원해요(이거 주세요). — bu + n + u → <b>bunu</b> '이것을'<br><br>튀르키예어의 '을/를'(-ı/-i/-u/-ü)은 <b>특정한 대상</b>에만 붙어요.<br>• ${b('Elma istiyorum.')} 사과(아무거나) 원해요<br>• ${b('Elmayı istiyorum.')} (바로 그) 사과를 원해요<br><br>시장에서는 두 문장이면 충분해요: ${b('Bir kilo elma, lütfen.')} / ${b('Bunu istiyorum.')}`,
        },
        items: [
          { q: '(진열된 물건을 가리키며) "이걸 원해요"', opts: ['Bunu istiyorum.', 'Bu istiyorum.', 'Buna istiyorum.'], a: 0, why: '특정한 "이것을" → bunu' },
          { q: '"사과 1킬로 주세요"', opts: ['Bir kilo elma, lütfen.', 'Bir kilo elmayı, lütfen.', 'Elma bir kilo lütfen mi.'], a: 0, why: '정해지지 않은 수량 → 목적격 없이 그냥 elma' },
          { q: '점원이 묻는 "다른 건요?"', opts: ['Başka bir şey?', 'Hepsi bu kadar.', 'Bunu istiyorum.'], a: 0, why: 'başka = 다른, bir şey = 무언가' },
        ],
        sents: [
          ['Bunu istiyorum.', '이걸로 주세요.'],
          ['Bir kilo elma, lütfen.', '사과 1킬로 주세요.'],
          ['İki kilo domates istiyorum.', '토마토 2킬로 주세요.'],
          ['Yarım kilo peynir, lütfen.', '치즈 반 킬로 주세요.'],
          ['Başka bir şey?', '다른 건요?'],
          ['Hepsi bu kadar.', '이게 다예요.'],
          ['Üç tane simit, lütfen.', '시미트 세 개 주세요.'],
          ['Hepsi ne kadar?', '전부 얼마예요?'],
        ],
      },
    ],
  },
  {
    id: 'u5', no: 5, title: '식당과 카페', tr: 'Lokantada', color: '#d63f7f',
    desc: '음식·음료, 주문하기, 맛 표현, -lı(~이 있는)',
    lessons: [
      {
        id: 'u5l1', title: '음식', tr: 'Yemekler',
        words: ['corba', 'kebap', 'pilav', 'salata', 'tavuk', 'balik', 'et', 'zeytin'],
        tip: {
          title: '튀르키예 식당 코스',
          html: `튀르키예 식당(lokanta)의 기본 흐름: ${b('çorba')}(수프) → ${b('kebap')}·${b('pilav')}(메인) → ${b('tatlı')}(디저트) → ${b('çay')}(차).<br><br>렌틸콩 수프 ${b('mercimek çorbası')}는 한국의 된장국처럼 어디서나 먹는 국민 메뉴예요. 레몬을 짜 넣어 드세요!`,
        },
        items: [
          { q: '"닭고기"', opts: ['tavuk', 'balık', 'et'], a: 0, why: 'tavuk = 닭·닭고기, balık = 생선, et = 고기' },
          { q: '식사의 첫 순서로 자주 먹는 것', opts: ['çorba', 'tatlı', 'çay'], a: 0, why: '수프(çorba)로 시작해요.' },
        ],
        sents: [
          ['Bir mercimek çorbası, lütfen.', '렌틸콩 수프 하나 주세요.'],
          ['Tavuk mu, et mi?', '닭고기요, 고기요?'],
          ['Balık var mı?', '생선 있어요?'],
          ['Pilav ve salata, lütfen.', '필라프랑 샐러드 주세요.'],
          ['Et yemiyorum.', '저는 고기를 안 먹어요.'],
          ['Kahvaltıda zeytin ve yumurta yerim.', '아침에 올리브와 계란을 먹어요.'],
        ],
      },
      {
        id: 'u5l2', title: '음료', tr: 'Çay mı, kahve mi?',
        words: ['cay', 'kahve', 'turk_kahvesi', 'ayran', 'meyve_suyu', 'sut', 'seker', 'bardak'],
        tip: {
          title: '차 문화',
          html: `튀르키예 사람들은 하루에도 몇 잔씩 튤립 모양 유리잔에 홍차(${b('çay')})를 마셔요. 손님에게 차를 권하는 건 기본 예의!<br><br>• ${b('Çay mı, kahve mi?')} 차? 커피?<br>• ${b('Şekerli mi?')} 설탕 넣어요?<br>• 튀르키예 커피는 설탕을 미리 넣고 끓여서 주문할 때 정해요: ${b('sade')}(무가당) · ${b('orta')}(보통) · ${b('şekerli')}(달게)`,
        },
        items: [
          { q: '"차? 아니면 커피?"', opts: ['Çay mı, kahve mi?', 'Çay ve kahve mi?', 'Çay mi, kahve mı?'], a: 0, why: 'çay(마지막 모음 a) → mı, kahve(e) → mi' },
          { q: '케밥과 곁들여 마시는 짭짤한 요거트 음료', opts: ['ayran', 'süt', 'meyve suyu'], a: 0, why: 'ayran은 케밥의 단짝이에요.' },
        ],
        sents: [
          ['Çay mı, kahve mi?', '차? 아니면 커피?'],
          ['Bir çay, lütfen.', '차 한 잔 주세요.'],
          ['Bir Türk kahvesi, lütfen.', '튀르키예 커피 한 잔 주세요.'],
          ['Şekerli mi?', '설탕 넣어요?'],
          ['Bir bardak su, lütfen.', '물 한 잔 주세요.'],
          ['Ayran var mı?', '아이란 있어요?'],
        ],
      },
      {
        id: 'u5l3', title: '주문하기', tr: 'Sipariş',
        words: ['menu', 'hesap', 'siparis', 'buyurun', 'afiyet_olsun', 'lokanta', 'bahsis', 'tabak'],
        tip: {
          title: '주문 공식 두 가지',
          html: `① <b>음식 + istiyorum</b> = ~ 주세요(원해요)<br>${b('Bir kebap istiyorum.')}<br><br>② <b>음식 + alabilir miyim?</b> = ~ 받을 수 있을까요? (더 공손)<br>${b('Menüyü alabilir miyim?')}<br><br>계산: ${b('Hesap, lütfen!')} 점원은 음식을 내오며 ${b('Buyurun')}(여기 있습니다), ${b('Afiyet olsun')}(맛있게 드세요)라고 해요.`,
        },
        items: [
          { q: '점원을 부르며 "계산서 주세요!"', opts: ['Hesap, lütfen!', 'Menü, lütfen!', 'Afiyet olsun!'], a: 0, why: 'hesap = 계산서' },
          { q: '더 공손한 주문은?', opts: ['Bir çay alabilir miyim?', 'Çay!', 'Çay var.'], a: 0, why: 'alabilir miyim? = 받을 수 있을까요?' },
          { q: '음식을 내온 점원이 하는 말', opts: ['Afiyet olsun!', 'Geçmiş olsun!', 'Güle güle!'], a: 0, why: 'Afiyet olsun = 맛있게 드세요' },
        ],
        sents: [
          ['Menüyü alabilir miyim?', '메뉴판 주시겠어요?'],
          ['Bir kebap istiyorum.', '케밥 하나 주세요.'],
          ['Sipariş vermek istiyorum.', '주문할게요.'],
          ['Buyurun, afiyet olsun!', '여기 있습니다, 맛있게 드세요!'],
          ['Garson, hesap lütfen!', '여기요, 계산서 주세요!'],
          ['Bir tabak daha, lütfen.', '접시 하나 더 주세요.'],
        ],
      },
      {
        id: 'u5l4', title: '맛 표현', tr: 'Çok lezzetli!',
        words: ['lezzetli', 'tatli', 'tuzlu', 'aci', 'eksi', 'sicak', 'soguk', 'ac', 'tok'],
        tip: {
          title: '맛과 배고픔',
          html: `${b('Çok lezzetli!')} 정말 맛있어요! — 요리한 사람에게 최고의 칭찬이에요.<br><br>배고픔도 '~이다'로 말해요: ${b('Açım.')} 배고파요(나는 배고픈 상태) / ${b('Tokum.')} 배불러요.<br><br>🌶️ ${b('acı')}는 '매운'과 '쓴' 둘 다예요. 튀르키예의 매운맛은 한국보다 순한 편이에요.<br>${b('tuz')}(소금) → ${b('tuzlu')}(짠): <b>-lı/-li/-lu/-lü</b> = '~이 들어 있는'`,
        },
        items: [
          { q: '"배고파요"', opts: ['Açım.', 'Acıyım.', 'Tokum.'], a: 0, why: 'aç(배고픈) + -ım(나는) → açım' },
          { q: '"이 수프 좀 짜요"', opts: ['Bu çorba biraz tuzlu.', 'Bu çorba biraz tatlı.', 'Bu çorba biraz soğuk.'], a: 0, why: 'tuz(소금) + -lu(~이 들어 있는) = tuzlu(짠)' },
          { q: 'tuz → tuzlu 처럼, şeker(설탕) → ?', opts: ['şekerli', 'şekerlu', 'şekerlı'], a: 0, why: 'şeker의 마지막 모음 e → -li: şekerli(달게, 설탕 넣은)' },
        ],
        sents: [
          ['Çok lezzetli!', '정말 맛있어요!'],
          ['Çorba biraz tuzlu.', '수프가 좀 짜요.'],
          ['Bu çok acı!', '이거 너무 매워요!'],
          ['Çok açım!', '너무 배고파요!'],
          ['Teşekkürler, tokum.', '고마워요, 배불러요.'],
          ['Çay çok sıcak.', '차가 아주 뜨거워요.'],
          ['Soğuk bir ayran, lütfen.', '시원한 아이란 하나 주세요.'],
        ],
      },
    ],
  },
];

export const LESSONS = UNITS.flatMap((u) => u.lessons.map((l, i) => ({ ...l, unit: u, idx: i })));
export const LESSON = new Map(LESSONS.map((l) => [l.id, l]));
export const unitOf = (lessonId) => LESSON.get(lessonId)?.unit;
