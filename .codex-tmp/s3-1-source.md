# 第一章：三角函數

本章節建立在基礎三角比之上，進一步推廣至廣義角與弧度量，並深入探討和差角、倍半角公式。核心重點在於三角函數圖形的特徵分析，以及如何利用正餘弦函數的疊合來處理極值與週期問題。

### 1-1 弧度量、扇形與三角比

#### 重點歸納

* **弧度量（弳）定義**：定義半徑為 **$r$** 的圓中，長度為 **$r$** 的弧所對的圓心角為 **$1$ 弧度**。換算關係為：**$\pi$ 弧度 $= 180^\circ$**，即 **$1$ 弧度 $\approx 57.3^\circ$**。  
* **扇形公式**：設圓半徑為 **$r$**，圓心角為 **$\theta$**（弧度制），則：  
* **弧長 $s = r\theta$**。  
* **面積 $A = \frac{1}{2}r^2\theta = \frac{1}{2}rs$**。  
* **基本關係式**：  
* **倒數關係**：**$\sin \theta \csc \theta = 1$**、**$\cos \theta \sec \theta = 1$**、**$\tan \theta \cot \theta = 1$**。  
* **商數關係**：**$\tan \theta = \frac{\sin \theta}{\cos \theta}$**、**$\cot \theta = \frac{\cos \theta}{\sin \theta}$**。  
* **平方關係**：**$\sin^2 \theta + \cos^2 \theta = 1$**、**$1 + \tan^2 \theta = \sec^2 \theta$**、**$1 + \cot^2 \theta = \csc^2 \theta$**。  
* **餘角關係**：**$\sin(90^\circ - \theta) = \cos \theta$**、**$\tan(90^\circ - \theta) = \cot \theta$**。  
* **廣義角三角比**：在標準位置角 $\theta$ 的終邊上取一點 $P(x, y)$，設 $r = \sqrt{x^2+y^2}$，定義 **$\sin \theta = \frac{y}{r}$**、**$\cos \theta = \frac{x}{r}$**、**$\tan \theta = \frac{y}{x}$**。

#### 重要題型

* **單位換算與扇形**：弧度與度數的互換，並求扇形之弧長、周長與面積。  
* **三角比恆等變形**：利用平方關係與商數關係，進行三角式化簡或求值（如已知 $\sin \theta + \cos \theta$ 求 $\sin \theta \cos \theta$）。  
* **廣義角判定**：判定特定角度（如 $100$ 弧度）所在的象限，或利用同界角概念求三角比。

### 1-2 和差角與倍半角公式

#### 重點歸納

* **和差角公式**：  
* **$\sin(\alpha \pm \beta) = \sin \alpha \cos \beta \pm \cos \alpha \sin \beta$**  
* **$\cos(\alpha \pm \beta) = \cos \alpha \cos \beta \mp \sin \alpha \sin \beta$**  
* **$\tan(\alpha \pm \beta) = \frac{\tan \alpha \pm \tan \beta}{1 \mp \tan \alpha \tan \beta}$**  
* **二倍角公式**：  
* **$\sin 2\theta = 2\sin \theta \cos \theta$**  
* **$\cos 2\theta = \cos^2 \theta - \sin^2 \theta = 2\cos^2 \theta - 1 = 1 - 2\sin^2 \theta$**  
* **$\tan 2\theta = \frac{2\tan \theta}{1 - \tan^2 \theta}$**  
* **三倍角公式**：  
* **$\sin 3\theta = 3\sin \theta - 4\sin^3 \theta$**  
* **$\cos 3\theta = 4\cos^3 \theta - 3\cos \theta$**  
* **半角公式**：  
* **$\sin^2 \frac{\theta}{2} = \frac{1 - \cos \theta}{2}$**、**$\cos^2 \frac{\theta}{2} = \frac{1 + \cos \theta}{2}$**（正負號由 $\frac{\theta}{2}$ 所在象限決定）。

#### 重要題型

* **精確值計算**：利用公式求非特殊角（如 $15^\circ, 75^\circ, 22.5^\circ$）的三角函數值。  
* **給條件求值**：已知 $\sin \alpha, \cos \beta$ 及象限，求 $\cos(\alpha+\beta)$ 或 $\sin 2\alpha$。  
* **方程式應用**：解包含二倍角公式的三角方程式，或利用公式進行降次運算。

### 1-3 三角函數的圖形

#### 重點歸納

* **基本函數特徵**：  
* **$y = \sin x$**：定義域為實數，值域為 **$-1, 1$**，週期為 **$2\pi$**。圖形對稱於 **原點**，為 **奇函數**。  
* **$y = \cos x$**：定義域為實數，值域為 **$-1, 1$**，週期為 **$2\pi$**。圖形對稱於 **$y$ 軸**，為 **偶函數**。  
* **$y = \tan x$**：週期為 **$\pi$**，漸近線為 **$x = n\pi + \frac{\pi}{2}$**。  
* **週期性規則**：若 $f(x)$ 週期為 $P$，則 **$y = f(kx + b)$** 的週期變為 **$\frac{P}{|k|}$**。  
* **圖形的變換**：  
* **伸縮**：$y = a \sin x$ 影響 **振幅**；$y = \sin kx$ 影響 **週期**。  
* **平移**：$y = \sin(x-h) + k$ 代表向右平移 $h$，向上平移 $k$。  
* **絕對值圖形**：例如 **$y = |\sin x|$** 的週期會縮半變為 **$\pi$**，且圖形恆在 $x$ 軸上方。

#### 重要題型

* **圖形判別與性質**：給予函數式判斷振幅、週期、相位平移，或判斷其對稱軸與對稱中心。  
* **實根個數判斷**：利用圖形交點法（例如：$y = \sin x$ 與 $y = \frac{x}{10\pi}$ 的交點數）判斷三角方程式的實根數量。  
* **複合函數的週期**：求如 $f(x) = \sin 3x + \cos 2x$ 等組合函數的最小正週期。

### 1-4 正餘弦函數的疊合

#### 重點歸納

* **疊合公式**：對於 **$f(x) = a \sin x + b \cos x$**，可化簡為 **$\sqrt{a^2+b^2} \sin(x + \theta)$**。  
* 其中 **$\cos \theta = \frac{a}{\sqrt{a^2+b^2}}$**，**$\sin \theta = \frac{b}{\sqrt{a^2+b^2}}$**。  
* 亦可疊合成餘弦形式：$a \sin x + b \cos x = \sqrt{a^2+b^2} \cos(x - \phi)$。  
* **極值性質**：若 $x$ 為任意實數，$f(x) = a \sin x + b \cos x$ 的最大值為 **$\sqrt{a^2+b^2}$**，最小值為 **$-\sqrt{a^2+b^2}$**。  
* **限制範圍的極值**：若 $x$ 有範圍限制（如 $0 \le x \le \frac{\pi}{2}$），則需畫出單位圓或疊合後的正弦波，觀察在該區間內函數的起點與終點，求出局部極值。  
* **二次式處理**：對於含有 $\sin^2 x, \sin x \cos x, \cos^2 x$ 的式子，先利用 **倍角公式** 降次，再進行疊合。

#### 重要題型

* **極值求值問題**：求 $y = a \sin x + b \cos x + c$ 在給定區間內的最大值與最小值。  
* **疊合與方程式**：解如 $a \sin x + b \cos x = k$ 的三角方程式，探討其解的存在性。  
* **幾何最大值應用**：在圓形或三角形中建立三角模型（例如：求矩形面積或路徑總長），利用疊合求最大值。  
* **換元法配方**：令 **$t = \sin x + \cos x$**，則 $\sin x \cos x = \frac{t^2-1}{2}$，藉此處理複合型的三角極值問題。

