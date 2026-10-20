import https from 'https';

https.get('https://sumanexport.in/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const titleMatch = data.match(/<title>([\s\S]*?)<\/title>/i);
    const descMatch = data.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const h1Matches = [...data.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    const h2Matches = [...data.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).slice(0, 8);
    
    console.log('=== COMPETITOR: SUMAN EXPORTS ===');
    console.log('TITLE:', titleMatch ? titleMatch[1].trim() : 'NONE');
    console.log('DESCRIPTION:', descMatch ? descMatch[1].trim() : 'NONE');
    console.log('H1 HEADINGS:', h1Matches);
    console.log('H2 HEADINGS:', h2Matches);
    console.log('PAGE LENGTH (chars):', data.length);
  });
}).on('error', (e) => {
  console.error('Error fetching competitor:', e.message);
});
