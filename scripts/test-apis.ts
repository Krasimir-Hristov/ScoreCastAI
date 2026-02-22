import { loadEnvConfig } from '@next/env';
import { fetchFixtures } from '../src/lib/football';
import { searchMatchContext } from '../src/lib/tavily';
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
  console.log('📰 [2/3] Тестване на Tavily API (searchMatchContext)...');
  const homeTeam = 'Real Madrid';
  const awayTeam = 'Barcelona';
  const news = await searchMatchContext(homeTeam, awayTeam);
  if (news.length > 0) {
    console.log(
      `✅ Успех! Намерени са ${news.length} новини за "${homeTeam} vs ${awayTeam}".`,
    );
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
    homeTeam,
    awayTeam,
    odds: { home: 2.1, draw: 3.5, away: 3.2 },
    recentNews: news.map((n) => n.title), // Подаваме заглавията от Tavily като контекст
  });

  if (prediction) {
    console.log('✅ Успех! Gemini генерира прогноза:');
    console.log(`   Победител (Winner): ${prediction.winner}`);
    console.log(
      `   Резултат (Score): ${prediction.predictedScore.home} - ${prediction.predictedScore.away}`,
    );
    console.log(`   Увереност (Confidence): ${prediction.confidence}`);
    console.log(`   Обосновка (Reasoning): ${prediction.reasoning}`);
    if (prediction.warnings && prediction.warnings.length > 0) {
      console.log(
        `   Предупреждения (Warnings): ${prediction.warnings.join(', ')}`,
      );
    }
  } else {
    console.log(
      '⚠️ Грешка при генериране на прогноза. Проверете GOOGLE_API_KEY.',
    );
  }
  console.log('=========================================\n');
}

runTests().catch(console.error);
