import { Product, StoreConfig } from '../types';

export const INITIAL_STORE_CONFIG: StoreConfig = {
  storeName: 'Hortifruti da Janete',
  isOpen: true,
  phoneWhatsApp: '5582993443337',
  formattedPhone: '(82) 99344-3337',
  addressDisplay: 'Feirinha da Jatiúca',
  deliveryFee: 5.00,
  minOrderValue: 20.00,
  estimatedDeliveryTime: '30 - 45 min',
  pixKey: '82993443337',
  pixKeyType: 'Celular',
  adminPassword: 'janete123'
};

export const INITIAL_PRODUCTS: Product[] = [
  // ==================== 1. FRUTAS (16 produtos) ====================
  {
    id: 'f-1',
    name: 'Banana Comprida (da Terra)',
    category: 'frutas',
    price: 2.50,
    unit: 'un',
    image: '/src/assets/images/banana_da_terra_perfeita_1787338305708.jpg',
    description: 'Banana da terra selecionada, graúda e perfeita para cozinhar, assar ou fritar.',
    inStock: true,
    badge: 'Fresquinha',
    isPopular: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'f-2',
    name: 'Banana Prata',
    category: 'frutas',
    price: 9.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=85',
    description: 'Bananas prata no ponto certo, docinhas e colhidas frescas da feira.',
    inStock: true,
    badge: 'Mais Vendido',
    isPopular: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-3',
    name: 'Maçã',
    category: 'frutas',
    price: 18.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=85',
    description: 'Maçãs vermelhas selecionadas, polpa crocante, doce e suculenta.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-4',
    name: 'Pera',
    category: 'frutas',
    price: 20.00,
    unit: 'kg',
    image: '/src/assets/images/pera_fresca_amarela_1787335475587.jpg',
    description: 'Pera Williams macia, refrescante e com muita doçura natural.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-5',
    name: 'Pera Portuguesa',
    category: 'frutas',
    price: 20.00,
    unit: 'kg',
    image: '/src/assets/images/pera_portuguesa_fresca_1787411644630.jpg',
    description: 'Pera portuguesa tipo Rocha, polpa amanteigada e sabor nobre.',
    inStock: true,
    badge: 'Importada',
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-6',
    name: 'Uva Verde Sem Semente',
    category: 'frutas',
    price: 20.00,
    unit: 'kg',
    image: '/src/assets/images/uva_verde_sem_semente_1787335895340.jpg',
    description: 'Uvas verdes selecionadas, crocantes, sem sementes e super doces.',
    inStock: true,
    badge: 'Sem Semente',
    isPopular: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-7',
    name: 'Uva Roxa',
    category: 'frutas',
    price: 15.00,
    unit: 'kg',
    image: '/src/assets/images/uva_roxa_fresca_1787411629899.jpg',
    description: 'Uva roxa fresca de mesa, aroma marcante e muito suculenta.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-8',
    name: 'Pokan (Tangerina)',
    category: 'frutas',
    price: 12.00,
    unit: 'kg',
    image: '/src/assets/images/pokan_tangerina_fresca_1787337134209.jpg',
    description: 'Tangerina Ponkan doce, casca frouxa fácil de descascar e muito suco.',
    inStock: true,
    badge: 'Da Época',
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-9',
    name: 'Laranja Pêra',
    category: 'frutas',
    price: 1.00,
    unit: 'un',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=700&q=85',
    description: 'Laranja pêra selecionada na banca, casca fina e rendimento incrível de suco.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'f-10',
    name: 'Laranja Lima',
    category: 'frutas',
    price: 1.40,
    unit: 'un',
    image: '/src/assets/images/laranja_lima_fresca_1787336125277.jpg',
    description: 'Laranja lima docinha, de baixa acidez, ideal para crianças e bebês.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'f-11',
    name: 'Limão',
    category: 'frutas',
    price: 1.00,
    unit: 'un',
    image: '/src/assets/images/limao_taiti_verde_1787336945313.jpg',
    description: 'Limão taiti verde, casca fina e muito caldo para temperos e sucos.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'f-12',
    name: 'Manga Rosa',
    category: 'frutas',
    price: 10.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=700&q=85',
    description: 'Manga rosa perfumada e doce, com sabor marcante da feira tradicional.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-13',
    name: 'Manga Tomi (Tommy)',
    category: 'frutas',
    price: 10.00,
    unit: 'kg',
    image: '/src/assets/images/manga_tommy_fresca_1787336933879.jpg',
    description: 'Manga Tommy Atkins carnuda, firme e excelente para cortar em cubos.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-14',
    name: 'Goiaba',
    category: 'frutas',
    price: 8.00,
    unit: 'kg',
    image: '/src/assets/images/goiaba_vermelha_fresca_1787336139276.jpg',
    description: 'Goiaba vermelha fresca e perfumada, polpa macia e rica em vitamina C.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'f-15',
    name: 'Amora 125 Gr',
    category: 'frutas',
    price: 10.00,
    unit: 'bandeja',
    image: '/src/assets/images/amora_fresca_bandeja_1787336922882.jpg',
    description: 'Bandeja com amoras frescas colhidas, escuras, firmes e doces.',
    inStock: true,
    badge: 'Especial',
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'f-16',
    name: 'Mirtilo 125 Gr',
    category: 'frutas',
    price: 13.00,
    unit: 'bandeja',
    image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=700&q=85',
    description: 'Bandeja com 125g de mirtilos frescos selecionados (blueberries antioxidantes).',
    inStock: true,
    badge: 'Superfood',
    minQty: 1,
    stepQty: 1
  },

  // ==================== 2. VERDURAS & FOLHAS (4 produtos) ====================
  {
    id: 'v-1',
    name: 'Alface (Americana, Crespa, Roxa e Lisa)',
    category: 'verduras',
    price: 4.00,
    unit: 'un',
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=700&q=85',
    description: 'Alface fresquinha e crocante colhida hoje (opções: americana, crespa, roxa ou lisa).',
    inStock: true,
    badge: 'Colhida Hoje',
    isPopular: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'v-2',
    name: 'Rúcula',
    category: 'verduras',
    price: 4.00,
    unit: 'maço',
    image: '/src/assets/images/rucula_fresca_horta_1787337951234.jpg',
    description: 'Maço farto de rúcula fresca, folhas verdes e sabor picante característico.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'v-3',
    name: 'Repolho Verde',
    category: 'verduras',
    price: 10.00,
    unit: 'kg',
    image: '/src/assets/images/repolho_verde_fresco_1787411660443.jpg',
    description: 'Repolho verde de cabeça compacta, folhas crocantes e excelente para saladas.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'v-4',
    name: 'Repolho Roxo',
    category: 'verduras',
    price: 13.00,
    unit: 'kg',
    image: '/src/assets/images/repolho_roxo_fresco_1787337694196.jpg',
    description: 'Repolho roxo com cor intensa e rica em antioxidantes, visual incrível na mesa.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },

  // ==================== 3. LEGUMES & VEGETAIS (11 produtos) ====================
  {
    id: 'l-1',
    name: 'Tomate',
    category: 'legumes',
    price: 8.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=700&q=85',
    description: 'Tomates vermelhos maduros e firmes, perfeitos para saladas e molhos frescos.',
    inStock: true,
    badge: 'Mais Vendido',
    isPopular: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-2',
    name: 'Cenoura',
    category: 'legumes',
    price: 8.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=700&q=85',
    description: 'Cenouras lisas, laranjas e crocantes, cheias de sabor e betacaroteno.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-3',
    name: 'Batatinha',
    category: 'legumes',
    price: 8.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85',
    description: 'Batatinha inglesa lavada, casca limpa, ótima para purê, cozinhar ou assar.',
    inStock: true,
    isPopular: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-4',
    name: 'Cebola Branca',
    category: 'legumes',
    price: 8.00,
    unit: 'kg',
    image: '/src/assets/images/cebola_branca_fresca_1787337682413.jpg',
    description: 'Cebola branca selecionada, casca sequinha e ótima durabilidade na dispensa.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-5',
    name: 'Cebola Roxa',
    category: 'legumes',
    price: 10.00,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=700&q=85',
    description: 'Cebola roxa aromática e suave, essencial para vinagrete e pratos frios.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-6',
    name: 'Pimentão Verde',
    category: 'legumes',
    price: 3.00,
    unit: 'un',
    image: '/src/assets/images/pimentao_verde_fresco_1787336329501.jpg',
    description: 'Pimentão verde brilhante, carnudo e crocante para refogados e carnes.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'l-7',
    name: 'Pimentão Amarelo',
    category: 'legumes',
    price: 9.00,
    unit: 'kg',
    image: '/src/assets/images/pimentao_amarelo_fresco_1787336955409.jpg',
    description: 'Pimentão amarelo doce e suave, fácil digestão e colorido incrível.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-8',
    name: 'Pimentão Vermelho',
    category: 'legumes',
    price: 9.00,
    unit: 'kg',
    image: '/src/assets/images/pimentao_vermelho_fresco_1787336343884.jpg',
    description: 'Pimentão vermelho maduro, adocicado e perfeito para grelhados e moquecas.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-9',
    name: 'Xuxu (Chuchu)',
    category: 'legumes',
    price: 3.00,
    unit: 'un',
    image: '/src/assets/images/chuchu_fresco_feira_1787333640924.jpg',
    description: 'Chuchu verde clarinho, tenro e leve, ideal para sopas e suflês.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'l-10',
    name: 'Feijão Verde',
    category: 'legumes',
    price: 25.00,
    unit: 'kg',
    image: '/src/assets/images/feijao_verde_fresco_premium_1787337388650.jpg',
    description: 'Feijão verde fresco debulhado no dia, macio e típico da culinária regional.',
    inStock: true,
    badge: 'Regional',
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'l-11',
    name: 'Maxixe e Quiabo (15 por $5)',
    category: 'legumes',
    price: 5.00,
    unit: 'un',
    image: '/src/assets/images/maxixe_quiabo_fresco_duo_1787337410033.jpg',
    description: 'Porção especial com 15 unidades de maxixes novinhos e quiabos tenros sem baba excessiva.',
    inStock: true,
    badge: '15 por R$5',
    isPopular: true,
    minQty: 1,
    stepQty: 1
  },

  // ==================== 4. RAÍZES & TUBÉRCULOS (6 produtos) ====================
  {
    id: 'r-1',
    name: 'Macaxeira Descascada a Vácuo',
    category: 'raizes',
    price: 7.00,
    unit: 'kg',
    image: '/src/assets/images/macaxeira_descascada_1787411682863.jpg',
    description: 'Macaxeira descascada e embalada a vácuo no pacotinho, branquinha, fresca e pronta para cozinhar macia.',
    inStock: true,
    badge: 'A Vácuo / Pronta',
    isPopular: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'r-2',
    name: 'Inhame',
    category: 'raizes',
    price: 13.00,
    unit: 'kg',
    image: '/src/assets/images/inhame_raiz_fresca_1787333630260.jpg',
    description: 'Inhame graúdo da terra, casca rústica, polpa clara e cheia de vitalidade.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'r-3',
    name: 'Batata Doce',
    category: 'raizes',
    price: 8.00,
    unit: 'kg',
    image: '/src/assets/images/batata_doce_fresca_1787336512018.jpg',
    description: 'Batata doce roxa/amarela, sabor adocicado ótimo para o café da manhã ou pós-treino.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'r-4',
    name: 'Cará',
    category: 'raizes',
    price: 10.00,
    unit: 'kg',
    image: '/src/assets/images/cara_raiz_fresca_1787333581677.jpg',
    description: 'Cará fresco e nutritivo, excelente cozido para acompanhar café com leite.',
    inStock: true,
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'r-5',
    name: 'Massa Puba',
    category: 'raizes',
    price: 14.00,
    unit: 'kg',
    image: '/src/assets/images/massa_puba_artesanal_1787333606037.jpg',
    description: 'Massa puba artesanal fresca, ótima para bolos tradicionais de mandioca e broas.',
    inStock: true,
    badge: 'Artesanal',
    minQty: 0.5,
    stepQty: 0.5
  },
  {
    id: 'r-6',
    name: 'Goma de Mandioca',
    category: 'raizes',
    price: 12.00,
    unit: 'kg',
    image: '/src/assets/images/goma_mandioca_tapioca_1787333616304.jpg',
    description: 'Goma fresca hidratada pronta para tapioca macia e soltinha na frigideira.',
    inStock: true,
    badge: 'Para Tapioca',
    minQty: 0.5,
    stepQty: 0.5
  },

  // ==================== 5. TEMPEROS & ERVAS (6 produtos) ====================
  {
    id: 't-1',
    name: 'Coentro e Cebolinha',
    category: 'temperos',
    price: 3.00,
    unit: 'maço',
    image: '/src/assets/images/cheiro_verde_1787277632912.jpg',
    description: 'Cheiro verde fresco (coentro e cebolinha) aromático com perfume de horta colhida cedo.',
    inStock: true,
    badge: 'Indispensável',
    isPopular: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 't-2',
    name: 'Cebolinha',
    category: 'temperos',
    price: 4.00,
    unit: 'maço',
    image: '/src/assets/images/cebolinha_fresca_maco_1787336528532.jpg',
    description: 'Maço farto de cebolinha verde fina e verdinha.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 't-3',
    name: 'Alho Grande',
    category: 'temperos',
    price: 4.00,
    unit: 'un',
    image: '/src/assets/images/alho_grande_fresco_1787336546741.jpg',
    description: 'Cabeça de alho graúdo selecionado, dentes grandes e sabor concentrado.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 't-4',
    name: 'Manjericão',
    category: 'temperos',
    price: 4.00,
    unit: 'maço',
    image: '/src/assets/images/manjericao_fresco_maco_1787335906724.jpg',
    description: 'Manjericão de folhas largas, aroma perfumado para molhos e massas.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 't-5',
    name: 'Alecrim',
    category: 'temperos',
    price: 5.00,
    unit: 'maço',
    image: '/src/assets/images/alecrim_fresco_maco_1787336798229.jpg',
    description: 'Ramos verdes de alecrim fresco colhido para assados, batatas e chás.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 't-6',
    name: 'Hortelã',
    category: 'temperos',
    price: 4.00,
    unit: 'maço',
    image: '/src/assets/images/hortela_fresco_maco_1787335488328.jpg',
    description: 'Hortelã verde fresca e refrescante, excelente para quibes, chás e sucos com abacaxi.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  },

  // ==================== 6. OVOS & MERCEARIA (3 produtos) ====================
  {
    id: 'm-1',
    name: 'Bandeja de Ovos Branco',
    category: 'mercearia',
    price: 25.00,
    unit: 'bandeja',
    image: '/src/assets/images/bandeja_ovos_brancos_1787336774381.jpg',
    description: 'Bandeja de 30 ovos brancos grandes, frescos e cuidadosamente embalados.',
    inStock: true,
    badge: 'Bandeja Grande',
    isPopular: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'm-2',
    name: 'Ovos Capoeira (15 und)',
    category: 'mercearia',
    price: 25.00,
    unit: 'bandeja',
    image: '/src/assets/images/ovos_capoeira_frescos_1787411699948.jpg',
    description: 'Ovos caipira de capoeira legítimos (embalagem com 15 unidades), gema alaranjada.',
    inStock: true,
    badge: 'Caipira Legítimo',
    isPopular: true,
    minQty: 1,
    stepQty: 1
  },
  {
    id: 'm-3',
    name: 'Coco Ralado',
    category: 'mercearia',
    price: 8.00,
    unit: 'un',
    image: '/src/assets/images/coco_ralado_fresco_1787336757460.jpg',
    description: 'Coco fresco ralado na hora, úmido e adocicado para tapiocas e doces.',
    inStock: true,
    minQty: 1,
    stepQty: 1
  }
];

export const INITIAL_MOCK_ORDERS = [
  {
    id: 'ord-1001',
    orderNumber: 'JAN-1001',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    timestamp: Date.now() - 1000 * 60 * 18,
    customer: {
      name: 'Mariana Silva',
      phone: '(11) 99123-4567',
      deliveryType: 'delivery' as const,
      street: 'Av. Paulista',
      number: '1578',
      neighborhood: 'Bela Vista',
      complement: 'Apto 42',
      reference: 'Próximo ao MASP'
    },
    paymentMethod: 'pix' as const,
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Banana Comprida
        quantity: 2,
        itemTotal: 5.00
      },
      {
        product: INITIAL_PRODUCTS[16], // Alface
        quantity: 1,
        itemTotal: 4.00
      },
      {
        product: INITIAL_PRODUCTS[20], // Tomate
        quantity: 1.5,
        itemTotal: 12.00
      }
    ],
    subtotal: 21.00,
    deliveryFee: 6.00,
    total: 27.00,
    status: 'pending' as const,
    notes: 'Por favor bananas no ponto!'
  },
  {
    id: 'ord-1002',
    orderNumber: 'JAN-1002',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    timestamp: Date.now() - 1000 * 60 * 42,
    customer: {
      name: 'Carlos Alberto Santos',
      phone: '(11) 98234-9988',
      deliveryType: 'delivery' as const,
      street: 'Rua Bela Cintra',
      number: '420',
      neighborhood: 'Consolação',
      complement: 'Bloco B, 101',
      reference: 'Portão preto'
    },
    paymentMethod: 'cash' as const,
    changeFor: 50.00,
    items: [
      {
        product: INITIAL_PRODUCTS[43], // Bandeja de Ovos Branco
        quantity: 1,
        itemTotal: 25.00
      },
      {
        product: INITIAL_PRODUCTS[32], // Inhame
        quantity: 1,
        itemTotal: 13.00
      }
    ],
    subtotal: 38.00,
    deliveryFee: 6.00,
    total: 44.00,
    status: 'preparing' as const
  },
  {
    id: 'ord-1003',
    orderNumber: 'JAN-1003',
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    timestamp: Date.now() - 1000 * 60 * 95,
    customer: {
      name: 'Beatriz Vasconcelos',
      phone: '(11) 97766-5544',
      deliveryType: 'pickup' as const
    },
    paymentMethod: 'card_delivery' as const,
    items: [
      {
        product: INITIAL_PRODUCTS[5], // Uva Verde Sem Semente
        quantity: 1,
        itemTotal: 20.00
      },
      {
        product: INITIAL_PRODUCTS[37], // Coentro e Cebolinha
        quantity: 2,
        itemTotal: 6.00
      },
      {
        product: INITIAL_PRODUCTS[14], // Amora 125 Gr
        quantity: 1,
        itemTotal: 10.00
      }
    ],
    subtotal: 36.00,
    deliveryFee: 0,
    total: 36.00,
    status: 'completed' as const
  }
];
