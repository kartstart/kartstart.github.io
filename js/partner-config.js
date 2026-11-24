import rules from './center-rules.js';

export default {
  name: 'Baku Karting & Event Center',
  logo: './assets/baku-center-logo.png',
  description: {
    ru: 'Крытый картодром в Баку с асфальтовой трассой длиной 430 м.',
    en: 'An indoor karting centre in Baku with a 430 m asphalt track.',
    az: 'Bakıda 430 m uzunluğunda asfalt trası olan qapalı kartinq mərkəzi.'
  },
  address: {
    ru: 'Баку, ул. Ахмеда Раджабли, 30/68, ТЦ Elit',
    en: '30/68 Ahmad Rajabli St., Elit Shopping Centre, Baku',
    az: 'Bakı, Əhməd Rəcəbli küçəsi 30/68, Elit Ticarət Mərkəzi'
  },
  hours: null,
  phone: { label: '+994 12 562 75 26', number: '+994125627526' },
  website: 'https://baku-karting.az/',
  instagram: 'https://www.instagram.com/bakukarting/',
  mapUrl: 'https://www.google.com/maps/dir/?api=1&destination=Baku%20Karting%20%26%20Event%20Center%2C%20Baku%2C%20Azerbaijan',
  booking: {
    url: 'https://singular-kheer-184228.netlify.app/',
    poster: './assets/baku-booking.webp',
    note: {
      ru: 'В форме бронирования для взрослых указаны рост до 200 см и вес до 120 кг.',
      en: 'The booking form lists a maximum height of 200 cm and weight of 120 kg for adults.',
      az: 'Rezervasiya formasında böyüklər üçün boy həddi 200 sm, çəki həddi 120 kq göstərilir.'
    },
    width: 691,
    height: 864
  },
  track: {
    image: './assets/baku-track.webp',
    width: 1692,
    height: 1626,
    pdf: './assets/baku-track.pdf',
    length: 430,
    widthMin: 3,
    widthMax: 6,
    description: {
      ru: 'Асфальтовая трасса с длинной прямой, быстрыми и медленными поворотами, узкими шиканами и поворотами на 180°.',
      en: 'The asphalt track includes a long straight, fast and slow corners, tight chicanes and 180° turns.',
      az: 'Asfalt trasda uzun düz yol, sürətli və yavaş döngələr, dar şikanlar və 180° döngələr var.'
    },
    alt: {
      ru: 'Схема трассы с клетчатой линией и зоной Pit-Stop',
      en: 'Track layout with a chequered line and the Pit-Stop area',
      az: 'Damalı xətt və Pit-Stop zonası ilə trasın sxemi'
    }
  },
  karts: [
    {
      name: 'ALPHA²', engine: 'Honda GX 200', powerKw: 4.8, powerHp: 6.5,
      tariffs: ['standard', 'insured']
    },
    {
      name: 'ALPHA²', engine: 'Honda GX 270', powerKw: 6.6, powerHp: 9,
      tariffs: ['membership']
    }
  ],
  prices: {
    rides: [
      { tariff: 'standard', minutes: 10, price: 20 },
      { tariff: 'insured', minutes: 10, price: 25 }
    ],
    rideNotes: [
      {
        ru: 'Подшлемник входит в стоимость обоих тарифов.',
        en: 'A balaclava is included with both rates.',
        az: 'Hər iki tarifdə balaklava ödənişə daxildir.'
      },
      {
        ru: 'Для иностранных граждан действует тариф со страховкой.',
        en: 'The insured rate applies to foreign nationals.',
        az: 'Xarici vətəndaşlar üçün sığortalı tarif tətbiq olunur.'
      }
    ],
    memberships: [
      { name: 'Silver', rides: 10, days: 90, price: 150 },
      { name: 'Gold', rides: 35, days: 180, price: 450 },
      { name: 'Platinum', rides: 75, days: 365, price: 850 }
    ],
    membershipNotes: [
      {
        ru: 'Для покупки абонемента время круга должно быть меньше 32 секунд.',
        en: 'A lap time under 32 seconds is required to buy a membership.',
        az: 'Abunə əldə etmək üçün dövrə vaxtı 32 saniyədən aşağı olmalıdır.'
      },
      {
        ru: 'По окончании срока абонемента баланс карты не обнуляется.',
        en: 'The card balance is kept when the membership expires.',
        az: 'Abunə müddəti bitdikdə kartın balansı sıfırlanmır.'
      }
    ],
    discount: {
      percent: 50,
      details: {
        ru: 'Скидка в день рождения и для близнецов',
        en: 'Discount for birthdays and twins',
        az: 'Ad günü və əkizlər üçün endirim'
      }
    }
  },
  rules
};
