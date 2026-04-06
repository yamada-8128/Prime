// --- アルゴリズム・データ構造 ---
const MAX_PRIME = 10000;

function sieveOfEratosthenes(max) {
  let sieve = new Array(max + 1).fill(true);
  sieve[0] = false; sieve[1] = false;
  for (let p = 2; p * p <= max; p++) {
	if (sieve[p]) {
	  for (let i = p * p; i <= max; i += p) sieve[i] = false;
	}
  }
  let primes = [];
  for (let p = 2; p <= max; p++) {
	if (sieve[p]) primes.push(p);
  }
  return { primes, sieve };
}

const { primes, sieve } = sieveOfEratosthenes(MAX_PRIME);
const isPrime = (n) => n <= MAX_PRIME ? sieve[n] : false;

function modPowBig(base, exp, mod) {
  let res = 1n;
  let b = BigInt(base) % BigInt(mod);
  let e = BigInt(exp);
  const m = BigInt(mod);
  while (e > 0n) {
	if (e % 2n === 1n) res = (res * b) % m;
	b = (b * b) % m;
	e /= 2n;
  }
  return res;
}

function getLuckyNumbers(max) {
  let lucky = [];
  // 最初の手順: 1, 3, 5, 7, ... (2番目ごとを除去)
  for (let i = 1; i <= max; i += 2) lucky.push(i);

  let idx = 1; // 次に「〇番目を除去」の基準となる数のインデックス
  while (idx < lucky.length) {
    let step = lucky[idx];
    if (step > lucky.length) break;

    let nextLucky = [];
    for (let i = 0; i < lucky.length; i++) {
      // step番目以外のものを残す
      if ((i + 1) % step !== 0) {
        nextLucky.push(lucky[i]);
      }
    }
    lucky = nextLucky;
    idx++;
  }
  return new Set(lucky); // 高速判定のために Set に変換
}

// 10000以下の幸運数を計算しておく
const luckySet = getLuckyNumbers(MAX_PRIME);

// 説明文に $...$ を使うことでLaTeXとして綺麗に表示されます
const primeTypes = [
	{
		id: "fermat",
		name: "フェルマー素数",
		description: "$2^{2^n} + 1$ の形で表される素数です。",
		isMatch: (p) => {
		if (p < 3) return false;
		let n = 0;
		while (true) {
			const fermat = 2 ** (2 ** n) + 1;
			if (fermat === p) return true;
			if (fermat > p) break;
			n++;
		}
		return false;
		},
		generateLimit: 5
	},
	{
		id: "mersenne",
		name: "メルセンヌ素数",
		description: "$2^n - 1$ の形で表される素数です。",
		isMatch: (p) => Number.isInteger(Math.log2(p + 1)),
		generateLimit: 5
	},
	{
		id: "sophie_germain",
		name: "ソフィ・ジェルマン素数",
		description: "$p$ が素数で、$2p + 1$ も素数になる場合の $p$ のことです。",
		isMatch: (p) => {
		const next = 2 * p + 1;
		if (next <= MAX_PRIME) return sieve[next];
		for(let i=2; i*i<=next; i++) { if(next%i===0) return false; }
		return true;
		},
		generateLimit: 10
	},
	{
		id: "safe",
		name: "安全素数",
		description: "$p$ が素数で、$\\frac{p-1}{2}$ も素数になる場合の $p$ のことです。",
		isMatch: (p) => {
		if (p === 2) return false;
		const prev = (p - 1) / 2;
		return isPrime(prev);
		},
		generateLimit: 10
	},
	{
		id: "factorial",
		name: "階乗素数",
		description: "$n! \\pm 1$ の形で表される素数です。",
		// 判定ロジック: n!+1 または n!-1 に一致するかチェック
		isMatch: (p) => {
			let f = 1n;
			for (let n = 1n; ; n++) {
			f *= n;
			// p が n!+1 または n!-1 なら True
			if (f + 1n === BigInt(p) || f - 1n === BigInt(p)) return true;
			// n! が p を超えすぎたら終了
			if (f > BigInt(p) + 1n) break;
			}
			return false;
		},
		generateLimit: 5
	},
	{
		id: "Euler",
		name: "オイラー素数",
		description: "オイラーの多項式 $n^2 + n + 41$ が素数を生成する範囲内の素数です。",
		isMatch: (p) => {
		for (let n = 0; n < 40; n++) {
			if (n * n + n + 41 === p) return true;
		}
		return false;
		},
		generateLimit: 10
	},
	{
		id: "twin",
		name: "双子素数",
		description: "差が $2$ である素数の組のどちらかとなる素数です。（例：$3$ と $5$、$11$ と $13$）",
		isMatch: (p) => isPrime(p - 2) || isPrime(p + 2),
		generateLimit: 10
	},
	{
		id: "super",
		name: "スーパー素数",
		description: "素数の数列において、素数番目に登場する素数のことです。",
		isMatch: (p) => {
			// primes配列からその素数が何番目かを取得 (配列は0始まりなので+1する)
			const index = primes.indexOf(p) + 1;
			return isPrime(index);
		},
		generateLimit: 10
	},
	{
		id: "pythagorean",
		name: "ピタゴラス素数",
		description: "$4n + 1$ の形で表される素数です。これらの素数は必ず2つの平方数の和（$x^2 + y^2$）で表すことができます。",
		isMatch: (p) => p % 4 === 1,
		generateLimit: 10
	},
	{
		id: "happy",
		name: "ハッピー素数",
		description: "各桁の数字を2乗して足す操作を繰り返したとき、最終的に $1$ になる素数です。",
		isMatch: (p) => {
			let n = p;
			let seen = new Set();
			while (n !== 1 && !seen.has(n)) {
			seen.add(n);
			n = n.toString().split('').reduce((sum, d) => sum + Math.pow(parseInt(d, 10), 2), 0);
			}
			return n === 1;
		},
		generateLimit: 10
	},
	{
		id: "fibonacci",
		name: "フィボナッチ素数",
		description: "フィボナッチ数列（$F_1=1, F_2=1, F_n=F_{n-1}+F_{n-2}$）に現れる素数です。",
		isMatch: (p) => {
			let a = 1, b = 1;
			while (b < p) {
			let temp = b;
			b = a + b;
			a = temp;
			}
			return b === p;
		},
		generateLimit: 10
	},
	{
		id: "lucky_prime",
		name: "幸運素数",
		description: "「幸運数」の選別過程（ウラムの篩）を生き残った、素数でもある数です。",
		// 事前計算した luckySet に含まれているかチェックするだけなので高速
		isMatch: (p) => luckySet.has(p),
		generateLimit: 10
	},
	{
		id: "emirp",
		name: "エマープ",
		description: "逆から数字を読んでも元の数と異なる別の素数になる素数です。",
		isMatch: (p) => {
		const str = p.toString();
		const rev = str.split('').reverse().join('');
		if (str === rev) return false;
		return isPrime(parseInt(rev, 10));
		},
		generateLimit: 10
	},
	{
		id: "palindromic",
		name: "回文素数",
		description: "逆から数字を読んでも元の数と同じになる素数です。",
		isMatch: (p) => {
			const str = p.toString();
			return str === str.split('').reverse().join('');
		},
		generateLimit: 10
	},
	{
		id: "wieferich",
		name: "ヴィーフェリッヒ素数",
		description: "$2^{p-1} - 1$ が $p^2$ で割り切れる、非常に珍しい素数です。",
		isMatch: (p) => {
		if (p === 2) return false;
		return modPowBig(2n, p - 1, p * p) === 1n;
		},
		generateLimit: 2
	}
];

function generateExamples(typeObj) {
  const examples = [];
  for (let p of primes) {
	if (typeObj.isMatch(p)) {
	  examples.push(p);
	  if (examples.length >= typeObj.generateLimit) break;
	}
  }
  return examples.join(', ') + (examples.length === typeObj.generateLimit ? ', ...' : '');
}

// --- UI・アプリロジック ---
let targetPrime = 0;

function initApp() {
  const select = document.getElementById('question-select');
  primeTypes.forEach(type => {
	const option = document.createElement('option');
	option.value = type.id;
	option.textContent = `この数は ${type.name} ですか？`;
	select.appendChild(option);
  });

  const zukanList = document.getElementById('zukan-list');
  primeTypes.forEach(type => {
	const div = document.createElement('div');
	div.className = 'zukan-item';
	
	// 最初の数個だけ表示する例
	const ex = generateExamples(type);
	
	// 10000以下の全リストを取得
	const allPrimesOfType = primes.filter(p => type.isMatch(p)).join(', ');

	div.innerHTML = `
	  <div class="zukan-title">${type.name}</div>
	  <div class="zukan-desc">${type.description}</div>
	  <div class="zukan-examples">例: ${ex}</div>
	  
	  <button class="show-all-btn" onclick="toggleFullList('${type.id}')" id="btn-${type.id}">
		10000以下の ${type.name} を全て表示
	  </button>
	  <div class="all-numbers-container" id="container-${type.id}">
		<div style="font-weight: bold; font-size: 0.8rem; margin-bottom: 5px; color: var(--text-muted);">
		  全リスト (${primes.filter(p => type.isMatch(p)).length} 個):
		</div>
		<div class="all-numbers-list">${allPrimesOfType}</div>
	  </div>
	`;
	zukanList.appendChild(div);
  });

  if (window.MathJax) {
	MathJax.typesetPromise();
  }

  resetGame();
}

// 全リストの表示・非表示を切り替える関数
function toggleFullList(typeId) {
  const container = document.getElementById(`container-${typeId}`);
  const btn = document.getElementById(`btn-${typeId}`);
  const typeObj = primeTypes.find(t => t.id === typeId);

  if (container.classList.contains('active')) {
	container.classList.remove('active');
	btn.textContent = `10000以下の ${typeObj.name} を全て表示`;
  } else {
	container.classList.add('active');
	btn.textContent = `閉じる`;
  }
}


// 桁数に応じた素数リストを取得
function getPrimesByDigits(digitConfig) {
  if (digitConfig === "2") return primes.filter(p => p >= 1 && p <= 99);
  if (digitConfig === "3") return primes.filter(p => p >= 100 && p <= 999);
  if (digitConfig === "4") return primes.filter(p => p >= 1000 && p <= 9999);
  return primes; // any (10000以下すべて)
}

function resetGame() {
  const digitConfig = document.getElementById('digit-select').value;
  const filteredPrimes = getPrimesByDigits(digitConfig);
  
  targetPrime = filteredPrimes[Math.floor(Math.random() * filteredPrimes.length)];
  
  document.getElementById('history-log').innerHTML = '<div style="font-weight: bold; margin-bottom: 10px;">質問履歴</div>';
  document.getElementById('guess-input').value = '';
  document.getElementById('result-message').textContent = '';
  document.getElementById('target-info').textContent = `${targetPrime.toString().length}桁の素数を1つ決定しました。質問をして数を絞り込んでください！`;
  
  // 開発・デバッグ用（ブラウザの開発者ツールで確認できます）
  console.log("正解の素数: " + targetPrime); 
}

function askQuestion() {
  const select = document.getElementById('question-select');
  const typeId = select.value;
  const typeObj = primeTypes.find(t => t.id === typeId);
  
  const result = typeObj.isMatch(targetPrime);
  
  const logDiv = document.getElementById('history-log');
  const item = document.createElement('div');
  item.className = 'log-item';
  
  const ansText = result ? 'はい' : 'いいえ';
  const ansClass = result ? 'ans-true' : 'ans-false';
  
  item.innerHTML = `
	<span>Q. ${typeObj.name}ですか？</span>
	<span class="${ansClass}">${ansText}</span>
  `;
  logDiv.insertBefore(item, logDiv.children[1]);
}

function guessPrime() {
  const guess = parseInt(document.getElementById('guess-input').value, 10);
  const msg = document.getElementById('result-message');
  if (guess === targetPrime) {
	msg.style.color = '#16a34a';
	msg.textContent = `大正解！素数は ${targetPrime} でした！`;
  } else {
	msg.style.color = '#dc2626';
	msg.textContent = '残念、違います。もう少し質問してみましょう。';
  }
}

// 答えを見る関数
function showAnswer() {
  const msg = document.getElementById('result-message');
  msg.style.color = '#d97706'; // オレンジ色
  msg.textContent = `正解は ${targetPrime} でした！`;
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
  
  document.querySelector(`.tab-btn[onclick="switchTab('${tabId}')"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

window.onload = initApp;