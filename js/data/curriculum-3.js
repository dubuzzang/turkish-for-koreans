// 11~15단원: 미래·희망 · 습관·가능·의무 · 건강 · 비교·묘사 · 문장 잇기
const b = (s) => `<b class="tr">${s}</b>`;

export const UNITS3 = [
  {
    id: 'u11', no: 11, title: '계획과 미래', tr: 'Planlar', color: '#0f766e', notes: ['future', 'want'],
    desc: '미래 -ecek, 부정·질문, "-고 싶다", 여행 계획',
    lessons: [
      {
        id: 'u11l1', title: '미래 -ecek', tr: 'Gideceğim', notes: ['future'],
        words: ['seyahat_etmek', 'rezervasyon_yapmak', 'kiralamak', 'gondermek', 'getirmek', 'goturmek', 'hazirlamak', 'tasinmak'],
        tip: {
          title: '"-ㄹ 거예요" = -ecek / -acak',
          html: `${b('gel-eceğ-im')} 올 거예요 · ${b('oku-y-acak')} 읽을 거예요(그)<br>모음 뒤에는 y: ${b('kirala-y-acağ-ım')}<br>ben·biz 앞에서 k → ğ: ${b('geleceğim')}, ${b('geleceğiz')} (sen·o·siz·onlar는 k 그대로: ${b('geleceksin')})<br><br>💡 "-ㄹ게요"(약속)도 -ecek으로: ${b('Seni arayacağım.')} 전화할게.`,
        },
        items: [
          { q: 'kirala + -acak + (나)', opts: ['kiralayacağım', 'kiralacağım', 'kiralayacakım'], a: 0, why: '모음 끝 → y, 1인칭 앞에서 k → ğ' },
          { q: 'gönder + -ecek + (너)', opts: ['göndereceksin', 'gönderecekin', 'gönderecaksın'], a: 0, why: '마지막 모음 e → -ecek, 너 = -sin' },
          { q: 'taşın + -acak + (우리)', opts: ['taşınacağız', 'taşınacakız', 'taşınecağız'], a: 0, why: '마지막 모음 ı → -acak, 우리 앞에서 k → ğ' },
        ],
        sents: [
          ["Yarın İzmir'e gideceğim.", '내일 이즈미르에 갈 거예요.'],
          ['Bir araba kiralayacağız.', '우리는 차를 빌릴 거예요.'],
          ['Fotoğrafları sana göndereceğim.', '사진들 너한테 보낼게.'],
          ['Kahvaltıyı ben hazırlayacağım.', '아침은 내가 준비할게.'],
          ['Gelecek ay yeni bir eve taşınacağız.', '다음 달에 새집으로 이사할 거예요.'],
          ['Otelde rezervasyon yapacak mısın?', '호텔 예약할 거야?'],
        ],
      },
      {
        id: 'u11l2', title: '약속과 질문', tr: 'Gelecek misin?', notes: ['future', 'question'],
        words: ['parti', 'konser', 'mac', 'bulusmak', 'evlenmek', 'soz_vermek', 'izin_vermek', 'kontrol_etmek'],
        tip: {
          title: '미래의 부정·질문',
          html: `부정: ${b('gel-me-y-eceğ-im')} 안 올 거예요<br>질문: ${b('Gelecek misin?')} 올 거야? — 인칭어미가 mi 뒤로 (현재진행과 같아요)<br><br>약속할 때: ${b('Söz veriyorum!')} 약속할게!`,
        },
        items: [
          { q: '"안 갈 거예요"', opts: ['Gitmeyeceğim.', 'Gitmeceğim.', 'Gidmeyeceğim.'], a: 0, why: 'git + me + y + eceğ + im (부정 me 뒤라 t는 그대로)' },
          { q: '"올 거야?"', opts: ['Gelecek misin?', 'Geleceksin mi?', 'Gelecek mısın?'], a: 0, why: 'gelecek + mi + sin (e → mi)' },
        ],
        sents: [
          ['Partiye gelecek misin?', '파티에 올 거야?'],
          ['Hayır, gelmeyeceğim.', '아니, 안 갈 거야.'],
          ['Konser saat kaçta başlayacak?', '콘서트는 몇 시에 시작해요?'],
          ['Maçı birlikte izleyecek miyiz?', '경기 같이 볼 거야?'],
          ['Söz veriyorum, unutmayacağım.', '약속할게, 안 잊을게.'],
          ['Gelecek yıl evlenecekler.', '그들은 내년에 결혼할 거예요.'],
        ],
      },
      {
        id: 'u11l3', title: '하고 싶어요', tr: 'Yüzmek istiyorum', notes: ['want'],
        words: ['spor_yapmak', 'sarki_soylemek', 'dans_etmek', 'gitar', 'hobi', 'yuruyus', 'yuzme', 'film'],
        tip: {
          title: '"-고 싶다" = -mek istiyorum',
          html: `동사 원형 + ${b('istiyorum')}: ${b('Yüzmek istiyorum.')} 수영하고 싶어요<br>한국어 "수영하-<b>고 싶</b>-어요"와 순서가 같아요!<br>부정: ${b('istemiyorum')} · 질문: ${b('istiyor musun?')}<br><br>정중한 제안은 광범위 시제: ${b('Şarkı söylemek ister misin?')} 노래할래?`,
        },
        items: [
          { q: '"춤추고 싶어요"', opts: ['Dans etmek istiyorum.', 'Dans istiyorum etmek.', 'Dans ediyorum istiyorum.'], a: 0, why: '동사 원형(dans etmek) + istiyorum' },
          { q: '"아무것도 하고 싶지 않아요"', opts: ['Hiçbir şey yapmak istemiyorum.', 'Hiçbir şey yapmıyorum istemek.', 'Hiçbir şey yapmak istiyorum değil.'], a: 0, why: '부정은 iste-mi-yorum' },
        ],
        sents: [
          ['Bu akşam film izlemek istiyorum.', '오늘 저녁엔 영화를 보고 싶어요.'],
          ['Gitar çalmak istiyorum.', '기타를 치고 싶어요.'],
          ['Hafta sonu yürüyüş yapmak istiyoruz.', '주말에 산책하고 싶어요.'],
          ['Ne yapmak istiyorsun?', '뭐 하고 싶어?'],
          ['Hiçbir şey yapmak istemiyorum.', '아무것도 하고 싶지 않아요.'],
          ['Şarkı söylemek ister misin?', '노래할래?'],
        ],
      },
      {
        id: 'u11l4', title: '여행 계획', tr: 'Tatil planı',
        words: ['plan', 'bavul', 'pasaport', 'kalkis', 'varis', 'rezervasyon', 'rehber', 'yolculuk'],
        tip: {
          title: '계획을 말해 봐요',
          html: `${b('Önce …, sonra …')} 먼저 …, 그다음 …<br>"~하러 가다" = 동사 + ${b('-meye/-maya gitmek')}: ${b('Yüzmeye gidiyoruz.')} 수영하러 가요<br><br>공항에서: ${b('Uçak saat kaçta kalkacak?')} 비행기 몇 시에 출발해요?`,
        },
        items: [
          { q: '"수영하러 가요"', opts: ['Yüzmeye gidiyoruz.', 'Yüzmek gidiyoruz.', 'Yüzmede gidiyoruz.'], a: 0, why: '목적(~하러) = -meye + gitmek' },
          { q: '"비행기는 몇 시에 출발해요?"', opts: ['Uçak saat kaçta kalkacak?', 'Uçak saat kaç kalkacak?', 'Uçak saatte kaç kalkacak?'], a: 0, why: '"몇 시에" = saat kaçta' },
        ],
        sents: [
          ['Tatil için planın var mı?', '휴가 계획 있어?'],
          ["Önce İstanbul'a, sonra Kapadokya'ya gideceğiz.", '먼저 이스탄불에, 그다음 카파도키아에 갈 거예요.'],
          ['Bavulumu hazırlamam lazım.', '여행 가방을 싸야 해요.'],
          ['Pasaportunu unutma!', '여권 잊지 마!'],
          ['Uçak saat kaçta kalkacak?', '비행기는 몇 시에 출발해요?'],
          ['Rehberimiz bizi havalimanında bekleyecek.', '가이드가 공항에서 우리를 기다릴 거예요.'],
        ],
      },
    ],
  },
  {
    id: 'u12', no: 12, title: '습관과 능력', tr: 'Alışkanlıklar', color: '#a16207', notes: ['aorist', 'abil', 'nec'],
    desc: '광범위 시제 -ir, 정중한 부탁, "-ㄹ 수 있다" -ebil, "-아야 한다" -meli',
    lessons: [
      {
        id: 'u12l1', title: '습관 말하기 -ir', tr: 'Her gün çay içerim', notes: ['aorist'],
        words: ['genellikle', 'bazen', 'sik_sik', 'her_zaman', 'asla', 'hep', 'artik', 'hic'],
        tip: {
          title: '광범위 시제 = "-는다 / -곤 해요"',
          html: `늘 하는 일·일반적 사실·성향: ${b('Her sabah çay içerim.')} 매일 아침 차를 마셔요<br><br>만드는 법:<br>• 모음 끝 → -r: ${b('okur')}, ${b('bekler')}<br>• 1음절 → -er/-ar: ${b('yapar')}, ${b('gider')}<br>• 1음절 예외 13개 → -ir: ${b('alır, gelir, bilir, bulur, durur, görür, kalır, olur, ölür, sanır, varır, verir, vurur')}<br>• 2음절 이상 → -ir: ${b('konuşur')}, ${b('öğrenir')}`,
        },
        items: [
          { q: 'yap + 광범위 (그)', opts: ['yapar', 'yapır', 'yaper'], a: 0, why: '1음절 → -ar (마지막 모음 a)' },
          { q: 'gel + 광범위 (나)', opts: ['gelirim', 'gelerim', 'gelrim'], a: 0, why: 'gel은 13개 예외 → -ir' },
          { q: 'konuş + 광범위 (그)', opts: ['konuşur', 'konuşar', 'konuşır'], a: 0, why: '2음절 → -ur (마지막 모음 u)' },
          { q: 'oku + 광범위 (그)', opts: ['okur', 'okuyur', 'okar'], a: 0, why: '모음 끝 → -r' },
        ],
        sents: [
          ['Her sabah çay içerim.', '매일 아침 차를 마셔요.'],
          ['Genellikle metroyla işe giderim.', '보통 지하철로 출근해요.'],
          ['Bazen Türk kahvesi içerim.', '가끔 튀르키예 커피를 마셔요.'],
          ['Babam hep gazete okur.', '아빠는 늘 신문을 읽으세요.'],
          ['Sık sık annemi ararım.', '엄마에게 자주 전화해요.'],
          ['Kediler balık sever.', '고양이는 생선을 좋아해요.'],
        ],
      },
      {
        id: 'u12l2', title: '부정과 정중한 부탁', tr: 'Çay içer misiniz?', notes: ['aorist'],
        words: ['sigara_icmek', 'korkmak', 'ozlemek', 'sevinmek', 'utanmak', 'sasirmak', 'sikilmak', 'hoslanmak'],
        tip: {
          title: '"-시겠어요?" = -ir misiniz?',
          html: `광범위 시제 질문은 정중한 권유·부탁이에요:<br>${b('Çay içer misiniz?')} 차 드시겠어요? · ${b('Yardım eder misiniz?')} 도와주시겠어요?<br><br>부정은 모양이 특이해요: ${b('gelmem')}(나), ${b('gelmezsin')}, ${b('gelmez')}, ${b('gelmeyiz')}, ${b('gelmezsiniz')}, ${b('gelmezler')}<br>${b('Sigara içmem.')} 저는 담배 안 피워요`,
        },
        items: [
          { q: '"저는 담배 안 피워요"', opts: ['Sigara içmem.', 'Sigara içmezim.', 'Sigara içmiyorum değil.'], a: 0, why: '광범위 부정 1인칭 = -mem' },
          { q: '"커피 드시겠어요?"', opts: ['Kahve içer misiniz?', 'Kahve içersiniz mi?', 'Kahve içiyor mu?'], a: 0, why: 'içer + mi + siniz — 인칭이 mi 뒤로' },
          { q: '"그는 개를 무서워하지 않아요"', opts: ['Köpeklerden korkmaz.', 'Köpeklerden korkmuyor değil.', 'Köpekleri korkmaz.'], a: 0, why: 'korkmak는 탈격 -den, 3인칭 부정 = -maz' },
        ],
        sents: [
          ['Çay içer misiniz?', '차 드시겠어요?'],
          ['Teşekkürler, kahve içmem.', '고맙지만 커피는 안 마셔요.'],
          ['Bana yardım eder misiniz?', '저 좀 도와주시겠어요?'],
          ['Köpeklerden korkarım.', '저는 개가 무서워요.'],
          ['Annem hiç sigara içmez.', '엄마는 담배를 전혀 안 피우세요.'],
          ['Evde çok sıkılırım.', '집에 있으면 너무 심심해요.'],
        ],
      },
      {
        id: 'u12l3', title: '할 수 있어요 -ebil', tr: 'Konuşabilirim', notes: ['abil'],
        words: ['yuzmek', 'kullanmak', 'anlatmak', 'gostermek', 'denemek', 'degistirmek', 'cizmek', 'tamir_etmek'],
        tip: {
          title: '"-ㄹ 수 있다" = -ebilir',
          html: `${b('gel-ebilir-im')} 올 수 있어요 · ${b('oku-y-abilir-im')} 읽을 수 있어요<br>못 해요: ${b('gel-eme-m')} 못 와요 (×gelebilmem)<br><br>허락: ${b('Buraya oturabilir miyim?')} 여기 앉아도 돼요?<br>부탁: ${b('Gösterebilir misiniz?')} 보여 주실 수 있어요?`,
        },
        items: [
          { q: '"수영할 수 있어요"', opts: ['Yüzebilirim.', 'Yüzerim bilir.', 'Yüzeyebilirim.'], a: 0, why: 'yüz + ebilir + im' },
          { q: '"(나는) 못 가요"', opts: ['Gelemem.', 'Gelmeyebilirim.', 'Gelmem bilir.'], a: 0, why: '불가능 = -eme-: gel-eme-m' },
          { q: '"이거 입어 봐도 돼요?"', opts: ['Bunu deneyebilir miyim?', 'Bunu deneyiyor muyum?', 'Bunu denerebilir miyim?'], a: 0, why: 'dene + y + ebilir + mi + yim' },
        ],
        sents: [
          ['Türkçe konuşabilir misiniz?', '튀르키예어 하실 수 있어요?'],
          ['Biraz konuşabilirim.', '조금 할 수 있어요.'],
          ['Bunu deneyebilir miyim?', '이거 입어 봐도 돼요?'],
          ['Yolu gösterebilir misiniz?', '길 좀 알려 주실 수 있어요?'],
          ['Yarın gelemem, çok işim var.', '내일은 못 가요, 일이 많아요.'],
          ['Bisikletimi tamir edebilir misin?', '내 자전거 고칠 수 있어?'],
        ],
      },
      {
        id: 'u12l4', title: '해야 해요 -meli', tr: 'Gitmeliyim', notes: ['nec'],
        words: ['lazim', 'gerekli', 'onemli', 'mutlaka', 'hemen', 'dikkat'],
        tip: {
          title: '"-아야 해요" = -meli / -mem lazım',
          html: `${b('git-meli-yim')} 가야 해요 · ${b('yap-malı-sın')} 너 해야 해<br>일상 대화: ${b('Gitmem lazım.')} (내가 가는 게 필요해 → 가야 해)<br>조언: ${b('Doktora gitmelisin.')} 병원에 가 봐야 해<br><br>⚠️ ${b('Dikkat et!')} 조심해! — 길에서 자주 들어요.`,
        },
        items: [
          { q: '"(나는) 가야 해요"', opts: ['Gitmeliyim.', 'Gidmeliyim.', 'Gitmeliim.'], a: 0, why: 'git + meli + y + im (m 앞이라 t 그대로)' },
          { q: '"(너는) 쉬어야 해"', opts: ['Dinlenmelisin.', 'Dinlenmalısın.', 'Dinlenmeli sen.'], a: 0, why: '마지막 모음 e → -meli, 너 = -sin' },
        ],
        sents: [
          ['Şimdi gitmeliyim, geç kaldım.', '이제 가야 해요, 늦었어요.'],
          ['Doktora gitmelisin.', '병원에 가 봐야 해.'],
          ['Vize gerekli mi?', '비자가 필요해요?'],
          ['Bu çok önemli, mutlaka gel.', '이건 정말 중요해, 꼭 와.'],
          ['Dikkat et, araba geliyor!', '조심해, 차 와!'],
          ['Hemen eve dönmem lazım.', '바로 집에 돌아가야 해요.'],
        ],
      },
    ],
  },
  {
    id: 'u13', no: 13, title: '몸과 건강', tr: 'Sağlık', color: '#dc2626', notes: ['nec', 'imperative'],
    desc: '몸 부위, "~가 아파요", 약국·병원, 건강 조언',
    lessons: [
      {
        id: 'u13l1', title: '몸', tr: 'Başım ağrıyor', notes: ['possessive'],
        words: ['bas', 'goz', 'kulak', 'burun', 'agiz', 'dis', 'el', 'ayak'],
        tip: {
          title: '"머리가 아파요" = Başım ağrıyor',
          html: `몸 + 소유 접미사 + ${b('ağrıyor')}: ${b('Baş-ım ağrıyor.')} (내 머리가 아프다)<br>한국어 "머리가 아파요"처럼 <b>아픈 부위가 주어</b>예요!<br><br>모음 탈락 주의: ${b('burun → burnum')} 내 코, ${b('ağız → ağzım')} 내 입`,
        },
        items: [
          { q: '"눈이 아파요"', opts: ['Gözüm ağrıyor.', 'Gözü ağrıyorum.', 'Ben göz ağrıyor.'], a: 0, why: 'göz-üm(내 눈) + ağrıyor' },
          { q: 'burun + 나의', opts: ['burnum', 'burunum', 'burunm'], a: 0, why: '모음 어미 앞에서 둘째 모음이 빠져요' },
        ],
        sents: [
          ['Başım ağrıyor.', '머리가 아파요.'],
          ['Dişim çok ağrıyor.', '이가 너무 아파요.'],
          ['Gözlerin çok güzel.', '네 눈 정말 예쁘다.'],
          ['Ellerini yıka!', '손 씻어!'],
          ['Ayaklarım çok yoruldu.', '발이 너무 피곤해요.'],
          ['Burnum tıkalı.', '코가 막혔어요.'],
        ],
      },
      {
        id: 'u13l2', title: '아파요', tr: 'Hastayım',
        words: ['hasta', 'ates', 'oksuruk', 'grip', 'nezle', 'agri', 'mide', 'bogaz'],
        tip: {
          title: '증상 말하기',
          html: `${b('Hastayım.')} 아파요(나는 환자다) · ${b('Ateşim var.')} 열이 있어요<br>${b('Grip oldum.')} 독감에 걸렸어요 · ${b('Midem bulanıyor.')} 속이 메스꺼워요<br><br>아픈 사람에게: ${b('Geçmiş olsun!')} 얼른 나으세요!`,
        },
        items: [
          { q: '"열이 있어요"', opts: ['Ateşim var.', 'Ateşliyim yok.', 'Ben ateş.'], a: 0, why: 'ateş-im(내 열) + var' },
          { q: '"목이 아파요(목구멍)"', opts: ['Boğazım ağrıyor.', 'Boğaz ağrıyorum.', 'Boğazımda ağrı.'], a: 0, why: 'boğaz-ım + ağrıyor' },
        ],
        sents: [
          ['Bugün hastayım, işe gidemem.', '오늘 아파서 출근 못 해요.'],
          ['Ateşim var.', '열이 있어요.'],
          ['Öksürüğüm geçmiyor.', '기침이 안 멈춰요.'],
          ['Grip oldum.', '독감에 걸렸어요.'],
          ['Midem bulanıyor.', '속이 메스꺼워요.'],
          ['Geçmiş olsun!', '얼른 나으세요!'],
        ],
      },
      {
        id: 'u13l3', title: '약국에서', tr: 'Eczanede',
        words: ['ilac', 'recete', 'saglik', 'iyilesmek', 'agrimak', 'yorulmak', 'kalp', 'vucut'],
        tip: {
          title: '약국 표현',
          html: `${b('Ağrı kesici var mı?')} 진통제 있어요?<br>${b('Bu ilacı nasıl kullanmalıyım?')} 이 약 어떻게 먹어야 해요?<br>${b('günde üç kez')} 하루 세 번 · ${b('yemekten sonra')} 식후<br><br>💡 튀르키예 약사(eczacı)는 가벼운 증상 상담을 잘해 줘요.`,
        },
        items: [
          { q: '"하루 두 번"', opts: ['günde iki kez', 'iki günde kez', 'günü iki kez'], a: 0, why: 'gün-de(하루에) + iki kez(두 번)' },
          { q: '"진통제 있어요?"', opts: ['Ağrı kesici var mı?', 'Ağrı var mı kesici?', 'Ağrı kesici mi var?'], a: 0, why: 'ağrı kesici(진통제) + var mı' },
        ],
        sents: [
          ['En yakın eczane nerede?', '가장 가까운 약국이 어디예요?'],
          ['Ağrı kesici var mı?', '진통제 있어요?'],
          ['Bu ilacı günde üç kez için.', '이 약은 하루 세 번 드세요.'],
          ['Reçeteniz var mı?', '처방전 있으세요?'],
          ['Doktordan randevu aldım.', '진료 예약했어요.'],
          ['Çabuk iyileş!', '빨리 나아!'],
        ],
      },
      {
        id: 'u13l4', title: '건강 조언', tr: 'Sağlıklı yaşam', notes: ['imperative', 'nec'],
        words: ['saglikli', 'taze', 'uyku', 'sebze', 'spor', 'meyve', 'yorgun'],
        tip: {
          title: '조언하기: -meli와 명령',
          html: `${b('Çok su içmelisin.')} 물을 많이 마셔야 해<br>${b('Erken yat!')} 일찍 자! · ${b('Geç yatma!')} 늦게 자지 마! (-me = "-지 마")<br><br>💡 ${b('Uykum var.')} = 내 잠이 있다 → 졸려요!`,
        },
        items: [
          { q: '"늦게 자지 마!"', opts: ['Geç yatma!', 'Geç yatmıyor!', 'Geç yatmaz!'], a: 0, why: '부정 명령 = 어간 + me/ma' },
          { q: '"우리는 물을 많이 마셔야 해요"', opts: ['Çok su içmeliyiz.', 'Çok su içmeli değil.', 'Çok su içebiliriz.'], a: 0, why: 'iç + meli + y + iz' },
        ],
        sents: [
          ['Uykum var.', '졸려요.'],
          ['Çok yorgunsun, biraz dinlen.', '너 많이 피곤하구나, 좀 쉬어.'],
          ['Her gün sebze ve meyve yemeliyiz.', '매일 채소와 과일을 먹어야 해요.'],
          ['Geç yatma!', '늦게 자지 마!'],
          ['Haftada üç gün spor yapıyorum.', '일주일에 3일 운동해요.'],
          ['Sağlık her şeyden önemli.', '건강이 무엇보다 중요해요.'],
        ],
      },
    ],
  },
  {
    id: 'u14', no: 14, title: '비교와 묘사', tr: 'Karşılaştırma', color: '#7c3aed', notes: ['comparison', 'postpositions'],
    desc: '"~보다 더" -dan daha, 최상급 en, "~처럼" gibi, 사람 묘사',
    lessons: [
      {
        id: 'u14l1', title: '더 ~ (비교)', tr: 'Daha büyük', notes: ['comparison'],
        words: ['buyuk', 'kucuk', 'yuksek', 'genis', 'dar', 'agir', 'hafif', 'daha'],
        tip: {
          title: '"A는 B보다 더 ~" = A, B-den daha ~',
          html: `${b("İstanbul Ankara'dan daha büyük.")} 이스탄불은 앙카라보다 더 커요<br>"보다"가 바로 탈격 <b>-dan/-den</b>! 어순도 한국어와 같아요.<br>${b('daha')}(더)는 생략해도 돼요: ${b('Abim benden uzun.')}`,
        },
        items: [
          { q: '"서울은 부산보다 커요"', opts: ["Seul Busan'dan büyük.", "Seul Busan'a büyük.", "Seul Busan'da büyük."], a: 0, why: '"보다" = 탈격 -dan' },
          { q: '"이 가방이 더 가벼워요"', opts: ['Bu çanta daha hafif.', 'Bu çanta en hafif.', 'Bu çanta hafif daha.'], a: 0, why: 'daha(더) + 형용사' },
        ],
        sents: [
          ["İstanbul Ankara'dan daha büyük.", '이스탄불은 앙카라보다 더 커요.'],
          ['Bu oda daha geniş.', '이 방이 더 넓어요.'],
          ['Bu bavul o bavuldan daha ağır.', '이 가방이 저 가방보다 더 무거워요.'],
          ['Metro otobüsten daha hızlı.', '지하철이 버스보다 더 빨라요.'],
          ['Abim benden uzun.', '오빠(형)는 나보다 키가 커요.'],
          ['Daha büyük bir beden var mı?', '더 큰 사이즈 있어요?'],
        ],
      },
      {
        id: 'u14l2', title: '가장 ~ (최상급)', tr: 'En güzel', notes: ['comparison'],
        words: ['en', 'unlu', 'eski', 'yeni', 'guzel', 'kalabalik', 'sakin', 'zengin'],
        tip: {
          title: '"가장 ~" = en ~',
          html: `${b('en güzel')} 가장 아름다운 · ${b('en sevdiğim')} 내가 가장 좋아하는<br>"~에서 가장 …한 ~" = 소유 표현: ${b("Türkiye'nin en büyük şehri")} 튀르키예의 가장 큰 도시`,
        },
        items: [
          { q: '"가장 좋아하는 음식"', opts: ['en sevdiğim yemek', 'daha sevdiğim yemek', 'sevdiğim en yemek'], a: 0, why: 'en + sevdiğim(내가 좋아하는) + yemek' },
          { q: '"튀르키예에서 가장 큰 도시"', opts: ["Türkiye'nin en büyük şehri", 'Türkiye en büyük şehir', "Türkiye'de daha büyük şehir"], a: 0, why: '속격 -nin + en büyük + şehr-i' },
        ],
        sents: [
          ["İstanbul Türkiye'nin en büyük şehri.", '이스탄불은 튀르키예에서 가장 큰 도시예요.'],
          ['Bu en güzel manzara!', '이게 최고의 경치예요!'],
          ['En sevdiğim yemek mantı.', '제가 가장 좋아하는 음식은 만트예요.'],
          ['Ayasofya çok eski bir yapı.', '아야소피아는 아주 오래된 건축물이에요.'],
          ['Burası en sakin mahalle.', '여기가 가장 조용한 동네예요.'],
          ['Taksim çok kalabalık.', '탁심은 아주 붐벼요.'],
        ],
      },
      {
        id: 'u14l3', title: '~처럼, 닮았어요', tr: 'Bal gibi', notes: ['postpositions'],
        words: ['gibi', 'ayni', 'farkli', 'baska', 'benzemek', 'ince', 'kalin'],
        tip: {
          title: 'gibi · kadar · benzemek',
          html: `${b('bal gibi')} 꿀처럼 · ${b('çocuk gibi')} 아이처럼<br>${b('-e benzemek')} ~를 닮다 (여격!): ${b('Annene benziyorsun.')}<br>${b('kadar')} ~만큼: ${b('benim kadar')} 나만큼 — 대명사는 속격(benim, senin)으로!`,
        },
        items: [
          { q: '"너는 엄마를 닮았어"', opts: ['Annene benziyorsun.', 'Anneni benziyorsun.', 'Annende benziyorsun.'], a: 0, why: 'benzemek는 여격: anne-n-e' },
          { q: '"나만큼 커"', opts: ['benim kadar uzun', 'ben kadar uzun', 'benden kadar uzun'], a: 0, why: '대명사 + kadar → 속격 benim' },
        ],
        sents: [
          ['Bu baklava bal gibi tatlı.', '이 바클라바는 꿀처럼 달아요.'],
          ['Türkçe biraz Korece gibi.', '튀르키예어는 한국어랑 좀 비슷해요.'],
          ['Annene çok benziyorsun.', '너 엄마를 많이 닮았구나.'],
          ['Aynı otobüse biniyoruz.', '우리 같은 버스를 타요.'],
          ['Başka bir renk var mı?', '다른 색 있어요?'],
          ['Kore ve Türkiye çok farklı mı?', '한국과 튀르키예는 많이 달라요?'],
        ],
      },
      {
        id: 'u14l4', title: '사람 묘사', tr: 'Nasıl biri?',
        words: ['genc', 'yasli', 'akilli', 'tembel', 'caliskan', 'nazik', 'sevimli', 'yakisikli'],
        tip: {
          title: '"어떤 사람이야?" = Nasıl biri?',
          html: `${b('biri')} = 어떤 사람: ${b('O çok nazik biri.')} 그는 아주 친절한 사람이야<br>형용사는 한국어처럼 명사 앞: ${b('çalışkan bir öğrenci')} 부지런한 학생 (bir는 형용사 뒤!)`,
        },
        items: [
          { q: '"부지런한 학생"', opts: ['çalışkan bir öğrenci', 'öğrenci bir çalışkan', 'bir öğrenci çalışkan'], a: 0, why: '형용사 + bir + 명사' },
          { q: '"그 사람 어떤 사람이야?"', opts: ['O nasıl biri?', 'O ne biri?', 'Nasıl o biri?'], a: 0, why: 'nasıl(어떤) + biri(사람)' },
        ],
        sents: [
          ['Yeni öğretmen nasıl biri?', '새 선생님은 어떤 분이야?'],
          ['Çok nazik ve akıllı biri.', '아주 친절하고 똑똑한 분이야.'],
          ['Kardeşim biraz tembel.', '동생은 좀 게을러요.'],
          ['Çalışkan bir öğrenci.', '부지런한 학생이에요.'],
          ['Dedem yaşlı ama çok güçlü.', '할아버지는 연세가 많으시지만 아주 정정하세요.'],
          ['Ne sevimli bir bebek!', '정말 귀여운 아기네요!'],
        ],
      },
    ],
  },
  {
    id: 'u15', no: 15, title: '문장 잇기', tr: 'Cümleleri bağlamak', color: '#0369a1', notes: ['converbs', 'conditional', 'relative', 'evidential'],
    desc: '접속사, "-고/-면서", "-ㄹ 때/-면", 관형절 "내가 읽은 책"',
    lessons: [
      {
        id: 'u15l1', title: '그리고·하지만·왜냐하면', tr: 've, ama, çünkü',
        words: ['ve', 'ama', 'fakat', 'cunku', 'bu_yuzden', 'veya', 'ya_da', 'ile'],
        tip: {
          title: '접속사',
          html: `${b('ve')} 그리고 · ${b('ama / fakat')} 하지만 · ${b('çünkü')} 왜냐하면 · ${b('bu yüzden')} 그래서 · ${b('veya / ya da')} 또는<br><br>${b('çünkü')}는 이유를 뒤에 말해요: ${b('Gelemedim çünkü hastaydım.')} 못 갔어요, 아팠거든요 — 한국어 "-거든요"와 비슷한 흐름!`,
        },
        items: [
          { q: '"피곤해서 집에 있어요"', opts: ['Yorgunum, bu yüzden evdeyim.', 'Yorgunum, çünkü evdeyim.', 'Yorgunum ama evdeyim.'], a: 0, why: 'bu yüzden = 그래서' },
          { q: '"차 또는 커피?"', opts: ['Çay veya kahve?', 'Çay ve kahve?', 'Çay ama kahve?'], a: 0, why: 'veya = 또는' },
        ],
        sents: [
          ['Gelemedim çünkü hastaydım.', '못 갔어요, 아팠거든요.'],
          ['Pahalı ama çok güzel.', '비싸지만 정말 예뻐요.'],
          ['Yağmur yağıyor, bu yüzden evde kalıyoruz.', '비가 와서 집에 있어요.'],
          ['Çay veya kahve?', '차 아니면 커피?'],
          ['Bugün ya da yarın gelirim.', '오늘이나 내일 갈게요.'],
          ['Ali ile Ayşe evlendi.', '알리와 아이셰가 결혼했어요.'],
        ],
      },
      {
        id: 'u15l2', title: '-고 / -면서', tr: 'Kalkıp gittim', notes: ['converbs'],
        words: ['giymek', 'cikmak', 'girmek', 'cikarmak', 'yurumek', 'kosmak', 'gulmek', 'aglamak'],
        tip: {
          title: '-ıp "-고", -arak "-면서/-서"',
          html: `${b('Kalk-ıp kahvaltı yaptım.')} 일어나서 아침을 먹었어요 — 시제·인칭은 마지막 동사에만!<br>${b('Yürü-y-erek gittik.')} 걸어서 갔어요 · ${b('Gül-erek anlattı.')} 웃으면서 이야기했어요<br><br>한국어 연결어미 "-고 / -면서 / -어서"와 거의 1:1이에요.`,
        },
        items: [
          { q: '"걸어서 가자"', opts: ['Yürüyerek gidelim.', 'Yürüyorum gidelim.', 'Yürümek gidelim.'], a: 0, why: '방법 "-서" = -erek' },
          { q: '"신발 벗고 들어와"', opts: ['Ayakkabılarını çıkarıp içeri gir.', 'Ayakkabılarını çıkar içeri girip.', 'Ayakkabılarını çıkarmak içeri gir.'], a: 0, why: '앞 동작 -ıp + 마지막 동사에 명령' },
        ],
        sents: [
          ['Sabah kalkıp kahvaltı yaptım.', '아침에 일어나서 아침을 먹었어요.'],
          ['Eve gelip yemek yaptık.', '집에 와서 요리했어요.'],
          ['Otele yürüyerek gidelim.', '호텔까지 걸어가자.'],
          ['Gülerek anlattı.', '그는 웃으면서 이야기했어요.'],
          ['Ayakkabılarını çıkarıp içeri gir.', '신발 벗고 들어와.'],
          ['Koşarak geldi.', '그는 뛰어서 왔어요.'],
        ],
      },
      {
        id: 'u15l3', title: '-ㄹ 때 / -면', tr: 'Gelince ararım', notes: ['converbs', 'conditional'],
        words: ['eger', 'belki', 'tekrar', 'yine', 'zaten', 'henuz'],
        tip: {
          title: '-ken · -ince · -se',
          html: `${b('-ken')} "-는 동안/-ㄹ 때": ${b('Yemek yerken konuşma!')} 먹는 동안 말하지 마!<br>${b('-ince')} "-면/-자": ${b('Eve gelince ararım.')} 집에 오면 전화할게<br>${b('-se')} "-(으)면"(조건): ${b('Zamanın varsa gel.')} 시간 있으면 와 · ${b('Gelirsen ara.')} 오면 연락해<br>${b('eğer')}(만약)는 강조용 — 생략해도 돼요.`,
        },
        items: [
          { q: '"시간 있으면 와"', opts: ['Zamanın varsa gel.', 'Zamanın var gel.', 'Zamanın varken gel.'], a: 0, why: 'var + sa = 있으면' },
          { q: '"집에 오면 전화할게"', opts: ['Eve gelince ararım.', 'Eve gelirken ararım.', 'Eve gelse ararım.'], a: 0, why: '-ince = -면/-자 (그때가 되면)' },
          { q: '"운전하는 동안 통화하지 마"', opts: ['Araba kullanırken telefonla konuşma.', 'Araba kullanınca telefonla konuşma.', 'Araba kullansa telefonla konuşma.'], a: 0, why: '-ken = -는 동안' },
        ],
        sents: [
          ['Eve gelince seni ararım.', '집에 가면 너한테 전화할게.'],
          ['Yemek yerken konuşma!', '먹는 동안 말하지 마!'],
          ['Zamanın varsa bize gel.', '시간 있으면 우리 집에 와.'],
          ['Eğer yağmur yağarsa evde kalırız.', '만약 비가 오면 집에 있을 거예요.'],
          ["Türkiye'ye gelirsen beni ara.", '튀르키예에 오면 나한테 연락해.'],
          ['Belki yarın tekrar gelirim.', '어쩌면 내일 또 올지도 몰라요.'],
        ],
      },
      {
        id: 'u15l4', title: '"내가 읽은 책"', tr: 'Okuduğum kitap', notes: ['relative'],
        words: ['kelime', 'cumle', 'anlam', 'ornek', 'bilgi', 'mesaj'],
        tip: {
          title: '관형절도 한국어 어순 그대로',
          html: `${b('gel-en adam')} 오는 남자 (주어가 하는) — "-는"<br>${b('oku-duğ-um kitap')} 내가 읽은 책 — "-(으)ㄴ"<br>${b('oku-y-acağ-ım kitap')} 내가 읽을 책 — "-(으)ㄹ"<br><br>꾸미는 말이 명사 앞에 오는 것까지 한국어와 같아요! "내가 읽은 책" = okuduğum kitap`,
        },
        items: [
          { q: '"내가 좋아하는 노래"', opts: ['sevdiğim şarkı', 'sevdiğin şarkı', 'seven şarkı'], a: 0, why: 'sev-diğ-im = 내가 좋아하는' },
          { q: '"튀르키예어를 하는 사람"', opts: ['Türkçe konuşan kişi', 'Türkçe konuştuğum kişi', 'Türkçe konuşacak kişi'], a: 0, why: '그 사람이 주어 → -an' },
          { q: '"내가 읽을 책"', opts: ['okuyacağım kitap', 'okuduğum kitap', 'okuyan kitap'], a: 0, why: '미래 관형 -acak + 소유' },
        ],
        sents: [
          ['En sevdiğim şarkı bu.', '내가 제일 좋아하는 노래는 이거예요.'],
          ['Dün okuduğum kitap çok ilginçti.', '어제 읽은 책은 정말 재미있었어요.'],
          ['Türkçe konuşan bir rehber arıyorum.', '튀르키예어를 하는 가이드를 찾고 있어요.'],
          ['Bu kelimenin anlamını bilmiyorum.', '이 단어의 뜻을 몰라요.'],
          ['Gönderdiğin mesajı gördüm.', '네가 보낸 메시지 봤어.'],
          ['Gideceğimiz yer çok güzel.', '우리가 갈 곳은 정말 아름다워요.'],
        ],
      },
    ],
  },
];
