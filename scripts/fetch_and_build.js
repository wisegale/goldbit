// Node script: fetches OKX paginated API and Binance price, writes dist/data.json and a static site in dist/
try {
data = await fetchPage(cursor);
} catch (e) {
console.error('fetchPage error', e.message || e);
break;
}


if (!data || typeof data !== 'object' || !data.data) break;
const d = data.data;
if (totalCount === null && typeof d.count === 'number') totalCount = d.count;
if (Array.isArray(d.items)) {
allItems = allItems.concat(d.items);
}
hasNext = !!d.hasNext;
// if server returns a cursor for next page you could use it; here we follow the user's page-index approach
page += 1;


// small delay to be gentle
await sleep(500);
}


return { totalCount, items: allItems };
}


async function fetchBinancePrice() {
try {
const r = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { timeout: 10000 });
return parseFloat(r.data.price);
} catch (e) {
console.error('Binance fetch error', e.message || e);
return null;
}
}


function buildStaticSite(dataFile) {
// copy public/ files into dist/
const publicDir = path.resolve(__dirname, '..', 'public');
const dest = DIST;
fs.cpSync(publicDir, dest, { recursive: true });
// write data
fs.writeFileSync(path.join(dest, 'data.json'), JSON.stringify(dataFile, null, 2));
}


(async () => {
console.log('Start fetch');
const start = Date.now();
const { totalCount, items } = await fetchAll();
console.log('fetched items', items.length, 'totalCount', totalCount);
const binancePrice = await fetchBinancePrice();
const out = {
fetchedAt: new Date().toISOString(),
totalCount: totalCount || items.length,
binancePriceUSD: binancePrice,
itemsCount: items.length,
items
};


// build
buildStaticSite(out);
console.log('Wrote dist/ with', items.length, 'items');
console.log('Elapsed', (Date.now()-start)/1000, 's');
})();
