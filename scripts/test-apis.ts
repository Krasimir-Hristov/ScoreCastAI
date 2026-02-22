import { loadEnvConfig } from '@next/env';
import { fetchFixtures } from '../src/lib/football';
import { searchNews } from '../src/lib/tavily';
import { generatePrediction } from '../src/lib/gemini';

// Зареждаме environment variables от .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function runTests() {
  console.log('=========================================');
  console.log('🧪 СТАРТИРАНЕ НА ТЕСТОВЕ ЗА ВЪНШНИ API-та');
  console.log('=========================================\n');

  // 1. Тест на Football API
  console.log('⚽ [1/3] Тестване на Football API (fetchFixtures)...');
  const fixtures = await fetchFixtures();
  if (fixtures.length > 0) {
    console.log(`✅ Успех! Намерени са ${fixtures.length} мача за днес.`);
    console.log(
      `   Първи мач: ${fixtures[0].teams.home.name} срещу ${fixtures[0].teams.away.name}`,
    );
  } else {
    console.log(
      '⚠️ Няма намерени мачове за днес или има грешка с API ключа (FOOTBALL_API_KEY).',
    );
  }
  console.log('-----------------------------------------\n');

  // 2. Тест на Tavily API
  console.log('📰 [2/3] Тестване на Tavily API (searchNews)...');
  const query = 'Real Madrid vs Barcelona';
  const news = await searchNews(query);
  if (news.length > 0) {
    console.log(`✅ Успех! Намерени са ${news.length} новини за "${query}".`);
    console.log(`   Първа новина: ${news[0].title}`);
  } else {
    console.log(
      '⚠️ Няма намерени новини или има грешка с API ключа (TAVILY_API_KEY).',
    );
  }
  console.log('-----------------------------------------\n');

  // 3. Тест на Gemini API
  console.log('🤖 [3/3] Тестване на Gemini API (generatePrediction)...');
  const prediction = await generatePrediction({
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    odds: { home: 2.1, draw: 3.5, away: 3.2 },
    recentNews: news.map((n) => n.title), // Подаваме заглавията от Tavily като контекст
  });

  if (prediction) {
    console.log('✅ Успех! Gemini генерира прогноза:');
    console.log(`   Изход (Outcome): ${prediction.outcome}`);
    console.log(`   Увереност (Confidence): ${prediction.confidence}`);
    console.log(`   Обосновка (Reasoning): ${prediction.reasoning}`);
  } else {
    console.log(
      '⚠️ Грешка при генериране на прогноза. Проверете GOOGLE_API_KEY.',
    );
  }
  console.log('=========================================\n');
}

runTests().catch(console.error);
