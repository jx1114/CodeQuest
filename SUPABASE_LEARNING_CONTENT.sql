-- Learning Content Catalog
-- Stores languages, courses, and chapter content for the Learning page.

CREATE TABLE IF NOT EXISTS learning_languages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS learning_courses (
  id TEXT PRIMARY KEY,
  language_id TEXT NOT NULL REFERENCES learning_languages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS learning_chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  explanation_html TEXT NOT NULL,
  example_html TEXT NOT NULL,
  mini_practice_example_html TEXT NOT NULL,
  mini_practice_output TEXT NOT NULL,
  mini_practice_question TEXT NOT NULL,
  mini_practice_answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

INSERT INTO learning_languages (id, name, description, icon, order_index) VALUES
  ('1', 'Python', 'Learn Python from basics to advanced concepts. Perfect for beginners and data science.', '/Python-Logo.png', 1),
  ('2', 'Java', 'Master object-oriented programming with Java. Build enterprise applications.', '/Java-Logo.png', 2),
  ('3', 'C++', 'Dive into systems programming and high-performance applications with C++.', '/C++-Logo.png', 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

INSERT INTO learning_courses (id, language_id, title, description, order_index) VALUES
  ('c1', '1', 'Complete Beginner Course', 'Start your programming journey from scratch', 1),
  ('c2', '2', 'Complete Beginner Course', 'Start your programming journey from scratch', 1),
  ('c3', '3', 'Complete Beginner Course', 'Start your programming journey from scratch', 1)
ON CONFLICT (id) DO UPDATE SET
  language_id = EXCLUDED.language_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

INSERT INTO learning_chapters (
  id,
  course_id,
  title,
  description,
  explanation_html,
  example_html,
  mini_practice_example_html,
  mini_practice_output,
  mini_practice_question,
  mini_practice_answer,
  order_index
) VALUES
  (
    'python-ch1',
    'c1',
    'Introduction & Setup',
    'Understand Python basics and how to run your first program',
    $$<p>Welcome to your first Python lesson. Before writing larger programs, you need to understand how Python runs code and why small details in syntax matter.</p><p><strong>Key terms:</strong> <code>interpreter</code> (runs Python code line by line), <code>syntax</code> (the grammar rules of the language), <code>runtime</code> (the environment where code executes), and <code>output</code> (the result shown after your code runs).</p><p>When beginners make mistakes, it is usually because of syntax or misunderstanding how execution flows. In the example below, focus on the exact print statement and the output it produces. That pattern will be used in every chapter.</p>$$,
      $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include &lt;iostream&gt;
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>print("Welcome")</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Welcome</p>$$,
    'CodeQuest',
    'Write code that produces exactly the target output.',
    'print("CodeQuest")',
    1
  ),
      $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include &lt;iostream&gt;
    'python-ch2',
    'c1',
    'Variables & Data Types',
    'Store, update, and convert values safely',
    $$<p>In real programs, you rarely print fixed text only. You store data in variables, then reuse and transform that data.</p><p><strong>Key terms:</strong> <code>variable</code> (a named storage location), <code>data type</code> (kind of value such as integer, float, or string), <code>assignment</code> (putting a value into a variable), and <code>literal</code> (a value written directly in code).</p><p>This chapter also introduces formatting so output looks professional. In the example, notice how numbers are stored first, then displayed with controlled decimal places.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>age = 21
price = 94.50
print(age)
print(f"Price: {price:.2f}")</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>points = 10
print(points)
revenue = 94.50
print(f"Revenue: {revenue:.2f}")</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 10<br>Revenue: 94.50</p>$$,
    '50\nTotal: 125.00',
    'Write code that assigns value and formats decimal output to 2 places.',
    'points = 50\nprint(points)\ntotal = 125.00\nprint(f"Total: {total:.2f}")',
    2
  ),
  (
    'python-ch3',
    'c1',
    'Control Flow',
    'Use conditionals and loops to control execution',
    $$<p>A program becomes useful when it can choose different actions and repeat tasks automatically. That is the purpose of control flow.</p><p><strong>Key terms:</strong> <code>condition</code> (true/false check), <code>branch</code> (different path based on a condition), <code>loop</code> (repeats a block of code), and <code>iteration</code> (one pass through a loop).</p><p>Read the example in two stages: first the decision using <code>if</code>, then the repetition using <code>for</code>. This is the foundation for writing dynamic logic in later challenges.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>score = 75
if score >= 60:
    print("Pass")
for i in range(1, 4):
    print(i)</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>n = 5
if n > 0:
    print("Positive")
for i in range(n):
    print(i)</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Positive<br>0<br>1<br>2<br>3<br>4</p>$$,
    'Small\n1\n2',
    'Write code using condition and loop logic that produces exactly the target output.',
    'n = 5\nif n < 10:\n    print("Small")\nfor i in range(1, 3):\n    print(i)',
    3
  ),
  (
    'python-ch4',
    'c1',
    'Functions',
    'Build reusable logic with clear inputs and outputs',
    $$<p>When code starts repeating, functions let you package logic into reusable units. This makes your code cleaner and easier to test.</p><p><strong>Key terms:</strong> <code>function</code> (named reusable block), <code>parameter</code> (input defined by the function), <code>argument</code> (actual value passed in), and <code>return</code> (value sent back to the caller).</p><p>In the example, trace the data flow: values enter the function, computation happens, and the result is returned and printed. Understanding that flow is the main goal of this chapter.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>def add(a, b):
    return a + b
print(add(2, 3))</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>def greet(name):
    return "Hi " + name
print(greet("Ana"))</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Hi Ana</p>$$,
    '8',
    'Write function-based code that produces exactly the target output.',
    'def double(x):\n    return x*2\nprint(double(4))',
    4
  ),
  (
    'python-ch5',
    'c1',
    'Data Structures',
    'Choose the right structure for storing and retrieving data',
    $$<p>As soon as programs handle more than one value, choosing the right data structure becomes important for readability and performance.</p><p><strong>Key terms:</strong> <code>list</code> (ordered collection), <code>dictionary</code> (key-to-value mapping), <code>set</code> (unique values only), and <code>key-value</code> (pair used for fast lookup).</p><p>This lesson focuses on dictionary-style access. In the example, pay attention to how a key is used to retrieve the exact value you need. That lookup pattern appears often in practical coding tasks.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>scores = {"Ana": 90}
print(scores["Ana"])</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>data = {"x": 1}
print(data["x"])</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 1</p>$$,
    '100',
    'Write data-structure code that produces exactly the target output.',
    'scores = {"A": 100}\nprint(scores["A"])',
    5
  ),
  (
    'java-ch1',
    'c2',
    'Introduction & Setup',
    'Understand Java basics and how to run your first program',
    $$<p>Welcome to Java fundamentals. Java programs follow a structured format, so understanding the execution model early prevents confusion later.</p><p><strong>Key terms:</strong> <code>JVM</code> (Java Virtual Machine that runs bytecode), <code>syntax</code> (language grammar), <code>class</code> (program structure unit), and <code>output</code> (text shown after execution).</p><p>In the example, focus on the required structure around <code>main</code> and the print statement. You will reuse this skeleton in almost every beginner Java exercise.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Hello, World!</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>System.out.println("Welcome");</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Welcome</p>$$,
    'CodeQuest',
    'Write code that produces exactly the target output.',
    'System.out.println("CodeQuest");',
    1
  ),
  (
    'java-ch2',
    'c2',
    'Variables & Data Types',
    'Store, update, and convert values safely',
    $$<p>Java is strongly typed, which means every variable must declare its data type clearly. This improves reliability and catches many mistakes early.</p><p><strong>Key terms:</strong> <code>variable</code> (named storage), <code>data type</code> (such as <code>int</code> or <code>double</code>), <code>assignment</code> (storing a value), and <code>literal</code> (a direct value in code).</p><p>In the example, see how type declarations guide the program and how formatted output makes numeric results easier to read in real applications.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int age = 21;
double price = 94.50;
System.out.println(age);
System.out.printf("Price: %.2f", price);</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int points = 10;
System.out.println(points);
double total = 94.50;
System.out.printf("Total: %.2f", total);</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 10<br>Total: 94.50</p>$$,
    '50\nTotal: 125.00',
    'Write code that assigns value and formats decimal output to 2 places.',
    'int points = 50;\nSystem.out.println(points);\ndouble total = 125.00;\nSystem.out.printf("Total: %.2f", total);',
    2
  ),
  (
    'java-ch3',
    'c2',
    'Control Flow',
    'Use conditionals and loops to control execution',
    $$<p>Control flow is how Java programs react to input and automate repeated tasks. Without it, programs can only run in a straight line.</p><p><strong>Key terms:</strong> <code>condition</code> (boolean check), <code>branch</code> (path selected by condition), <code>loop</code> (repeated execution), and <code>iteration</code> (one loop cycle).</p><p>Study the example by separating two ideas: decision logic in the <code>if</code> block and repetition logic in the <code>for</code> block. Together they form the core of most algorithms.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int score = 75;
if (score >= 60) {
  System.out.println("Pass");
}
for (int i = 1; i <= 3; i++) {
  System.out.println(i);
}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int n = 5;
if (n > 0) {
  System.out.println("Positive");
}
for (int i = 0; i < n; i++) {
  System.out.println(i);
}</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Positive<br>0<br>1<br>2<br>3<br>4</p>$$,
    'Small\n1\n2',
    'Write code using condition and loop logic that produces exactly the target output.',
    'int n = 5;\nif (n < 10) {\n  System.out.println("Small");\n}\nfor (int i = 1; i < 3; i++) {\n  System.out.println(i);\n}',
    3
  ),
  (
    'java-ch4',
    'c2',
    'Functions',
    'Build reusable logic with clear inputs and outputs',
    $$<p>In Java, reusable behavior is written as methods. Methods reduce duplication and make your program easier to maintain.</p><p><strong>Key terms:</strong> <code>method</code> (function inside a class), <code>parameter</code> (named input in method definition), <code>argument</code> (value passed at call time), and <code>return</code> (result sent back).</p><p>In the example, follow the full lifecycle: define method, call method with arguments, receive the return value, and print it. That sequence is essential for beginner problem solving.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>public static int add(int a, int b) {
  return a + b;
}
System.out.println(add(2, 3));</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>static int square(int n) { return n*n; }
System.out.println(square(4));</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 16</p>$$,
    '8',
    'Write function-based code that produces exactly the target output.',
    'static int doubleNum(int x){ return x*2; }\nSystem.out.println(doubleNum(4));',
    4
  ),
  (
    'java-ch5',
    'c2',
    'Data Structures',
    'Choose the right structure for storing and retrieving data',
    $$<p>Data structures determine how efficiently your Java program stores and retrieves information. Choosing correctly makes code clearer and faster.</p><p><strong>Key terms:</strong> <code>array/list</code> (ordered values), <code>map</code> (key-to-value lookup), <code>set</code> (unique values), and <code>key-value</code> (identifier paired with data).</p><p>This chapter emphasizes map usage. In the example, observe how values are inserted with a key and retrieved by the same key, which is a common real-world pattern for lookups.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>HashMap<String, Integer> scores = new HashMap<>();
scores.put("Ana", 90);
System.out.println(scores.get("Ana"));</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>HashMap<String,Integer> m = new HashMap<>();
m.put("x", 1);
System.out.println(m.get("x"));</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 1</p>$$,
    '100',
    'Write data-structure code that produces exactly the target output.',
    'HashMap<String,Integer> scores = new HashMap<>();\nscores.put("A",100);\nSystem.out.println(scores.get("A"));',
    5
  ),
  (
    'cpp-ch1',
    'c3',
    'Introduction & Setup',
    'Understand C++ basics and how to run your first program',
    $$<p>Welcome to C++ basics. C++ is powerful, but beginners need a clear mental model of program structure before writing larger solutions.</p><p><strong>Key terms:</strong> <code>compiler</code> (translates source code to executable code), <code>syntax</code> (language grammar rules), <code>main</code> (entry point of the program), and <code>output</code> (text produced by execution).</p><p>In the example below, notice the full structure: include directives, <code>main</code> function, output statement, and return value. This structure will appear repeatedly in your C++ practice.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include &lt;iostream&gt;
using namespace std;

int main() {
  cout << "Hello, World!" << endl;
  return 0;
}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Hello, World!</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>#include &lt;iostream&gt;
using namespace std;

int main() {
  cout << "Welcome" << endl;
  return 0;
}</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Welcome</p>$$,
    'CodeQuest',
    'Write code that produces exactly the target output.',
    '#include &lt;iostream&gt;\nusing namespace std;\n\nint main() {\n  cout << "CodeQuest" << endl;\n  return 0;\n}',
    1
  ),
  (
    'cpp-ch2',
    'c3',
    'Variables & Data Types',
    'Store, update, and convert values safely',
    $$<p>Variables are the foundation of any C++ program. You declare a type, store a value, and then use it in calculations or output.</p><p><strong>Key terms:</strong> <code>variable</code> (named storage), <code>data type</code> (such as <code>int</code> or <code>double</code>), <code>assignment</code> (placing a value into a variable), and <code>literal</code> (hard-coded value in source code).</p><p>This chapter also introduces formatted numeric output. In the example, watch how the same value can be displayed in a clean, user-friendly format using fixed precision.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int age = 21;
  double price = 94.50;
  cout << age << endl;
  cout << fixed << setprecision(2) << "Price: " << price << endl;</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 21<br>Price: 94.50</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int points = 10;
  cout << points << endl;
  double total = 94.50;
  cout << fixed << setprecision(2) << "Total: " << total << endl;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 10<br>Total: 94.50</p>$$,
    '50\nTotal: 125.00',
    'Write code that assigns value and formats decimal output to 2 places.',
    '#include &lt;iostream&gt;\n#include &lt;iomanip&gt;\nusing namespace std;\n\nint main() {\n  int points = 50;\n  cout << points << endl;\n  double total = 125.00;\n  cout << fixed << setprecision(2) << "Total: " << total;\n  return 0;\n}',
    2
  ),
  (
    'cpp-ch3',
    'c3',
    'Control Flow',
    'Use conditionals and loops to control execution',
    $$<p>Control flow lets your C++ program respond to conditions and handle repeated work efficiently. This is where logic becomes dynamic.</p><p><strong>Key terms:</strong> <code>condition</code> (true/false expression), <code>branch</code> (path selected by condition), <code>loop</code> (repeated block), and <code>iteration</code> (single loop pass).</p><p>Read the example in order: evaluate condition, choose branch, then iterate over a loop. That sequence appears in almost every beginner algorithm problem.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int score = 75;
if (score >= 60) {
  cout << "Pass" << endl;
}
for (int i = 1; i <= 3; i++) {
  cout << i << endl;
}</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> Pass<br>1<br>2<br>3</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int n = 5;
if (n > 0) {
  cout << "Positive" << endl;
}
for (int i = 0; i < n; i++) {
  cout << i << endl;
}</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> Positive<br>0<br>1<br>2<br>3<br>4</p>$$,
    'Small\n1\n2',
    'Write code using condition and loop logic that produces exactly the target output.',
    '#include &lt;iostream&gt;\nusing namespace std;\n\nint main() {\n  int n = 5;\n  if (n &lt; 10) {\n    cout << "Small" << endl;\n  }\n  for (int i = 1; i &lt; 3; i++) {\n    cout << i << endl;\n  }\n  return 0;\n}',
    3
  ),
  (
    'cpp-ch4',
    'c3',
    'Functions',
    'Build reusable logic with clear inputs and outputs',
    $$<p>Functions help you split complex C++ code into reusable and testable pieces. This keeps programs easier to read and debug.</p><p><strong>Key terms:</strong> <code>function</code> (named reusable logic), <code>parameter</code> (input declared by function), <code>argument</code> (actual value passed), and <code>return</code> (value sent back to caller).</p><p>In the example, follow the workflow: function definition, function call, returned result, and printed output. Mastering this flow is essential before moving to larger projects.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int add(int a, int b) {
  return a + b;
}
cout << add(2, 3) << endl;</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 5</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>int square(int n) { return n*n; }
cout << square(4) << endl;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 16</p>$$,
    '8',
    'Write function-based code that produces exactly the target output.',
    '#include &lt;iostream&gt;\nusing namespace std;\n\nint doubleNum(int x){ return x*2; }\n\nint main() {\n  cout << doubleNum(4) << endl;\n  return 0;\n}',
    4
  ),
  (
    'cpp-ch5',
    'c3',
    'Data Structures',
    'Choose the right structure for storing and retrieving data',
    $$<p>Data structures are how C++ programs manage collections of information. The right structure makes code both cleaner and more efficient.</p><p><strong>Key terms:</strong> <code>array</code> (fixed-size ordered values), <code>map</code> (key-to-value storage), <code>set</code> (unique values), and <code>key-value</code> (identifier paired with data).</p><p>This chapter focuses on map lookups. In the example, notice how a value is stored under a key and retrieved using that same key, a pattern used heavily in real applications.</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>map&lt;string, int&gt; scores;
scores["Ana"] = 90;
cout << scores["Ana"] << endl;</code></pre><p class="mt-3 text-sm text-slate-700"><strong>Output:</strong> 90</p>$$,
    $$<pre class="rounded-lg bg-slate-900 p-4 text-slate-100 overflow-x-auto"><code>map&lt;string,int&gt; m;
m["x"] = 1;
cout << m["x"] << endl;</code></pre><p class="mt-2 text-sm text-slate-700"><strong>Output:</strong> 1</p>$$,
    '100',
    'Write data-structure code that produces exactly the target output.',
    '#include &lt;iostream&gt;\n#include &lt;map&gt;\nusing namespace std;\n\nint main() {\n  map&lt;string,int&gt; scores;\n  scores["A"] = 100;\n  cout << scores["A"] << endl;\n  return 0;\n}',
    5
  )
ON CONFLICT (id) DO UPDATE SET
  course_id = EXCLUDED.course_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  explanation_html = EXCLUDED.explanation_html,
  example_html = EXCLUDED.example_html,
  mini_practice_example_html = EXCLUDED.mini_practice_example_html,
  mini_practice_output = EXCLUDED.mini_practice_output,
  mini_practice_question = EXCLUDED.mini_practice_question,
  mini_practice_answer = EXCLUDED.mini_practice_answer,
  order_index = EXCLUDED.order_index;
