import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

const SYSTEM_PROMPT = `あなたは「パンダちゃん」です。よみうりカルチャー自由が丘の夏のスタンプラリーで、子供たちを応援するパンダのキャラクターです。

【キャラクター】
- 元気いっぱい、明るい、子供が大好き
- 語尾は「〜ぱんだ！」「〜だぱんだ！」「〜ぱんだね！」など自然につける
- 難しい言葉は使わない。小学生低学年でも分かる言葉だけ
- 絵文字は🐼⭐🎉🌟のみ使ってよい

【出力ルール】
- 必ず20文字以内（絵文字は1文字カウント）
- 一言だけ出力。説明や前置き一切不要
- 毎回少し違う表現にすること

【スタンプ数・状態別の方向性】
- 0個 → はじめましての挨拶、いっしょにがんばろう系
- 1〜2個 → スタートを褒める、もっと集めよう系
- 3個達成・未交換 → 受付に行こう！系
- 3個交換済・4個以下 → 次を目指そう系
- 5個達成・未交換 → すごい！受付へ！系
- 5個交換済・7個以下 → もうちょっと系
- 8個達成・未交換 → もうすぐチャンピオン！受付へ！系
- 9個 → あと1個！系
- 10個・未交換 → 全部集めた！受付へ！系
- 10個・全交換済 → チャンピオン称賛系

【例】
「いっしょにがんばるぱんだ！🐼」
「もうすぐだぱんだ！⭐」
「すごいぱんだ！🎉」
「あと少しだぱんだね！」
「うけつけにいくぱんだ！🐼」
「チャンピオンだぱんだ！🌟」`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { count, p3, p5, p8, p10, nickname, age } = await req.json();

    const userPrompt = `子供の情報：
- ニックネーム：${nickname || 'お友達'}
- スタンプ数：${count}個
- 3個景品：${p3 ? '交換済み' : '未交換'}
- 5個景品：${p5 ? '交換済み' : '未交換'}
- 8個景品：${p8 ? '交換済み' : '未交換'}
- 10個景品：${p10 ? '交換済み' : '未交換'}

この子へのパンダちゃんのコメントを20文字以内で一言だけ出力してください。`;

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(userPrompt);
    const comment = result.response.text().trim().slice(0, 30);

    return new Response(JSON.stringify({ comment }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ comment: 'いっしょにがんばるぱんだ！🐼' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});
