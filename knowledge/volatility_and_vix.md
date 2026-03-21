# Volatility and the VIX

## What Is Volatility?
In financial markets, volatility measures the magnitude of price fluctuations. High volatility means large, unpredictable price swings. Low volatility means calm, steady price movement.

Two types:
- **Realized (Historical) Volatility:** Actual past price movements, calculated from historical data
- **Implied Volatility:** Forward-looking volatility extracted from options prices — the market's expectation of future volatility

## The VIX
The VIX (CBOE Volatility Index) is the most important volatility measure in global finance. Often called the "Fear Gauge" or "Fear Index."

It measures the 30-day implied volatility of S&P 500 options — specifically, how much the market expects the S&P 500 to move over the next 30 days, annualized.

```
VIX = Market's Expected S&P 500 Annualized Volatility (30-day)
```

A VIX of 20 implies the market expects the S&P 500 to move approximately ±20% annualized, or roughly ±5.8% over the next 30 days.

## VIX Level Interpretation

| VIX Level | Market Regime |
|---|---|
| Below 12 | Extreme complacency, very calm |
| 12-20 | Normal, risk-on environment |
| 20-25 | Elevated uncertainty |
| 25-35 | Significant stress, risk-off |
| 35-50 | Crisis conditions |
| Above 50 | Extreme crisis (2008: 89, COVID March 2020: 85) |

## VIX and Equity Correlation
The VIX and S&P 500 have a strong negative correlation — when stocks fall, the VIX spikes and vice versa. This relationship is asymmetric:
- Markets fall faster than they rise (panic vs greed)
- Volatility spikes are sudden and violent
- Volatility tends to mean-revert — elevated VIX eventually returns to lower levels

## Volatility Spikes and Their Causes

### Geopolitical Events
Wars, terrorist attacks, election shocks (Brexit, Trump 2016) cause sudden volatility spikes.

### Economic Data Shocks
Dramatically worse-than-expected GDP, employment, or inflation data.

### Central Bank Surprises
Unexpected rate decisions or hawkish pivots (Taper Tantrum, BoJ rate hike August 2024).

### Financial System Stress
Bank failures (SVB March 2023), liquidity crises, credit events, sovereign debt crises.

### Volatility Feedback Loops
When volatility rises above certain thresholds, systematic strategies (risk parity, vol-targeting funds) are forced to reduce equity exposure automatically, which causes more selling, which causes more volatility — a self-reinforcing feedback loop.

## Volatility Surface
Options traders look at the full volatility surface — implied volatility across different strikes and expirations:
- **Volatility Skew:** OTM puts typically have higher implied vol than OTM calls (investors pay more for downside protection)
- **Volatility Term Structure:** Usually upward sloping (longer-dated options have higher vol); inverts during crises (near-term fear dominates)
- **VVIX:** Volatility of the VIX — measures how uncertain the market is about future volatility

## VIX Derivatives and Trading Volatility
Traders express volatility views through:
- **VIX Futures:** Direct exposure to expected future VIX levels
- **VIX Options:** Options on VIX futures
- **Variance Swaps:** Pay/receive realized variance vs fixed rate
- **Volatility ETFs:** VXX (long VIX), SVXY (short VIX)

Short volatility strategies (selling options, short VIX) earn steady income in calm periods but can blow up catastrophically. The "Volmageddon" event of February 2018 saw short-VIX ETFs lose 90%+ in a single day.

## Cross-Asset Volatility
VIX is equity volatility, but macro traders watch volatility across all markets:
- **MOVE Index:** Bond market volatility (interest rate volatility)
- **CVIX:** Currency volatility index
- **OVX:** Oil volatility
- **GVZ:** Gold volatility

When volatility rises simultaneously across multiple asset classes, it signals genuine systemic stress — not just equity market nervousness.

## Volatility as a Macro Regime Indicator
Sustained low volatility breeds complacency and risk-taking (Minsky moment — stability leads to instability). Long periods of low VIX are warning signs that:
- Leverage is building in the system
- Risk is being underpriced
- The eventual spike will be larger

## Bottom Line
The VIX is the market's real-time fear barometer. Rising VIX = reduce risk, buy protection. Falling VIX from elevated levels = gradually add risk. The most dangerous thing in markets is a VIX that has been too low for too long.
