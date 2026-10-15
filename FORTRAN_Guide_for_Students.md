# FORTRAN Guide for Students Who Already Know QBASIC, C, PHP, and JavaScript

### _From Zero to Hero - A Practical, Comparative Guide_

---

> **Who this book is for:** You already write code. You know QBASIC's line-numbered world, C's pointers and structs, PHP's loose web-facing pragmatism, and JavaScript's dynamic, event-driven universe. Now you're stepping into Fortran - the language that has been computing the physics of the universe since 1957. This guide respects what you already know and builds bridges, not walls.

---

## A Note to Students from Nepal

This book is written with **you** specifically in mind.

If you have passed Nepal's **National Examinations Board (NEB)** at the +2 (Higher Secondary) level - whether through the Science stream or the Computer Science elective - you have already covered exactly the four languages this book uses as reference points:

- **QBASIC** is taught in the early grades (SEE level) and carried into +2 as a foundation for algorithmic thinking.
- **C** is a core programming language in the NEB +2 Science/Computer Science curriculum, covering structured programming, arrays, functions, and file handling.
- **PHP** appears in the web technology and database units of the NEB +2 Computer Science curriculum.
- **JavaScript** is covered in the web development sections, alongside HTML/CSS, in NEB +2.

By the time you sit your NEB board examinations and pass, you have touched all four of these languages in a classroom setting. You may not feel like an expert in all of them - and that's fine - but the concepts are in your head: variables, loops, functions, arrays, and basic I/O.

### Why Fortran Comes Next

When you enroll in a **bachelor's degree** in Nepal - particularly in:

- **B.Sc. CSIT** (Bachelor of Science in Computer Science and Information Technology) at Tribhuvan University
- **BE Computer Engineering**, **BE Electronics**, or **BE Civil Engineering** at IOE (Institute of Engineering), Pulchowk Campus and affiliated colleges
- **B.Sc. Physics**, **B.Sc. Mathematics**, or **B.Sc. Chemistry** at TU, PU, or KU faculties of Science

…you will encounter **numerical methods and scientific computing** courses. These courses - whether titled _Numerical Methods_, _Computational Physics_, _Numerical Analysis_, or _Scientific Computing_ - require you to implement algorithms such as Newton-Raphson, Runge-Kutta, Gaussian elimination, and numerical integration. In many colleges in Nepal, these are implemented in **Fortran**, because:

1. The prescribed textbooks (particularly those following Indian and international university syllabi used as references at TU/IOE) include Fortran code listings.
2. Laboratory practicals in numerical methods courses at many Nepali colleges are conducted in Fortran.
3. Fortran remains the dominant language in scientific computing globally, so faculty trained in computational science naturally use it.

### What This Means for You

You do not need to start from zero. The NEB curriculum has already given you the programming instincts - variable types, control flow, loops, functions - that this book builds on. Every chapter maps Fortran concepts directly to what you already know from your +2 classes. When you see a Fortran `do` loop, you will recognise your C `for` loop. When you see a Fortran `module`, you will recognise your PHP `namespace` or JS `import`. When you see `real :: x`, you will recognise your C `float x`.

This book takes you from "I passed NEB and know four languages" to "I can write and understand Fortran programs for my bachelor's numerical methods lab" - and beyond, to modern professional Fortran.

> **A word of encouragement:** Many students find Fortran intimidating because it looks old. It is old - and that is a feature, not a bug. It means decades of stability, a language that does exactly what it says, and compilers that produce some of the fastest numerical code on the planet. Your NEB foundation is stronger than you think. Trust it, and let this guide do the bridging.

---

## Table of Contents

1. [Why Fortran? A Honest Answer](#chapter-1-why-fortran-a-honest-answer)
2. [History and Dialects - What Version Are You Using?](#chapter-2-history-and-dialects)
3. [Setting Up Your Environment](#chapter-3-setting-up-your-environment)
4. [Hello, World - Your First Fortran Program](#chapter-4-hello-world)
5. [Program Structure - The Big Picture](#chapter-5-program-structure)
6. [Variables, Types, and Declarations](#chapter-6-variables-types-and-declarations)
7. [Operators and Expressions](#chapter-7-operators-and-expressions)
8. [Input and Output](#chapter-8-input-and-output)
9. [Control Flow - IF, SELECT, Loops](#chapter-9-control-flow)
10. [Arrays - Fortran's Superpower](#chapter-10-arrays)
11. [Subroutines and Functions](#chapter-11-subroutines-and-functions)
12. [Modules - The Modern Way](#chapter-12-modules)
13. [String Handling](#chapter-13-string-handling)
14. [File I/O](#chapter-14-file-io)
15. [Pointers and Dynamic Memory](#chapter-15-pointers-and-dynamic-memory)
16. [Derived Types - Fortran's Structs](#chapter-16-derived-types)
17. [Object-Oriented Fortran](#chapter-17-object-oriented-fortran)
18. [Numerical Computing and Intrinsics](#chapter-18-numerical-computing-and-intrinsics)
19. [Parallelism with OpenMP and Coarrays](#chapter-19-parallelism)
20. [Interoperability with C](#chapter-20-interoperability-with-c)
21. [Common Pitfalls and Gotchas](#chapter-21-common-pitfalls)
22. [Real-World Project: Numerical Simulation](#chapter-22-real-world-project)
23. [Going Further - Resources and Next Steps](#chapter-23-going-further)

---

## Chapter 1: Why Fortran? A Honest Answer

Before a single line of code, let's answer the obvious question: _why would anyone learn Fortran in the 21st century?_

### The Real Reasons

**Performance.** Fortran compilers are extraordinarily good at optimising numerical loops. The language was _designed_ for floating-point math, and decades of compiler research have gone into making it fast. NASA, CERN, weather forecasting services, and financial institutions run Fortran code in production - not out of nostalgia, but because it is genuinely fast.

**Legacy codebases.** Millions of lines of Fortran exist in scientific libraries (BLAS, LAPACK, FFTPACK, MINPACK). If you work in physics, chemistry, engineering, or computational science, you _will_ encounter Fortran.

**Modern Fortran is not your grandfather's Fortran.** Fortran 90, 95, 2003, 2008, and 2018 added modules, dynamic memory, object-oriented programming, parallelism, and C interoperability. Modern Fortran looks nothing like the punched-card era FORTRAN IV you may have heard horror stories about.

### Comparison Table: What You Already Know

| Feature        | QBASIC        | C                | PHP             | JavaScript            | Fortran (Modern)       |
| -------------- | ------------- | ---------------- | --------------- | --------------------- | ---------------------- |
| Typing         | Dynamic/loose | Static, explicit | Dynamic         | Dynamic               | Static, explicit       |
| Memory         | Automatic     | Manual           | Automatic       | Automatic (GC)        | Mostly automatic       |
| Arrays         | 1-based       | 0-based          | Associative     | 0-based               | 1-based (configurable) |
| OOP            | No            | No (structs)     | Yes             | Yes (prototype/class) | Yes (Fortran 2003+)    |
| Strings        | Easy          | Hard (char\*)    | Easy            | Easy                  | Fixed/allocatable      |
| Exponentiation | `^`           | `pow()`          | `**`            | `**`                  | `**`                   |
| Primary use    | Learning      | Systems          | Web             | Web/General           | Scientific computing   |
| Compilation    | Interpreted   | Compiled         | Interpreted/JIT | JIT/Interpreted       | Compiled               |

---

## Chapter 2: History and Dialects

Understanding Fortran's history saves you from confusion when you read old code vs. new code.

### The Timeline

**FORTRAN I (1957)** - IBM 704. The first high-level language. Everything was uppercase, column-dependent, and punched on cards.

**FORTRAN IV / FORTRAN 66** - Standardised. Still column-dependent. The "old" Fortran most people warn you about.

**FORTRAN 77** - Added structured `IF/THEN/ELSE`, `DO` loops with `ENDDO`. Still fixed-format (columns matter).

**Fortran 90** - _The revolution._ Free-format source. Modules. Dynamic arrays. Pointers. New-style loops. This is the minimum modern Fortran.

**Fortran 95** - Minor cleanup of 90.

**Fortran 2003** - Object-oriented programming. C interoperability. IEEE arithmetic. Vastly improved I/O.

**Fortran 2008** - Coarrays (built-in parallelism). Submodules.

**Fortran 2018** - Better C interop. More parallel improvements. Latest standard.

### Which Fortran Should You Write?

**Write Fortran 2003 or later.** This guide targets **Fortran 2008/2018** with all modern features. We will note when something is "old-style" so you can recognise legacy code.

### File Extensions

| Extension              | Meaning                                  |
| ---------------------- | ---------------------------------------- |
| `.f` or `.for`         | Fixed-format (old style, FORTRAN 77 era) |
| `.f90`                 | Free-format, Fortran 90+                 |
| `.f95`, `.f03`, `.f08` | Standard-specific free-format            |

**Always use `.f90` or later for new code.**

---

## Chapter 3: Setting Up Your Environment

### Compilers

**GFortran** (GNU Fortran) - Free, open-source, runs on Linux/macOS/Windows. This is what we use in this guide.

**Intel Fortran (ifx/ifort)** - Industry-standard, free for personal and student use. Best performance on Intel hardware.

**Flang** - LLVM-based Fortran compiler. Growing in popularity.

### Installation

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install gfortran
```

**macOS (Homebrew):**

```bash
brew install gcc   # includes gfortran
```

**Windows:**
Install [MSYS2](https://www.msys2.org/) then:

```bash
pacman -S mingw-w64-x86_64-gcc-fortran
```

Or install [WSL2](https://learn.microsoft.com/en-us/windows/wsl/) and use the Linux instructions.

### Verifying Installation

```bash
gfortran --version
```

Expected output: `GNU Fortran (GCC) 12.x.x ...`

### Editors and IDEs

- **VS Code** with the _Modern Fortran_ extension (syntax highlighting, hover docs, linting)
- **Vim/Neovim** with `fortran.vim`
- **Eclipse Photran** - dedicated Fortran IDE
- **CLion** with Fortran plugin

### Compiling and Running

```bash
# Compile
gfortran -o myprogram myprogram.f90

# Compile with warnings and debugging
gfortran -Wall -Wextra -g -o myprogram myprogram.f90

# Run
./myprogram
```

**From your C experience:** This will feel natural. Fortran compilation is similar to `gcc`.

---

## Chapter 4: Hello, World

Let's start with something familiar and immediately compare it to what you know.

### Fortran

```fortran
program hello
    implicit none
    print *, "Hello, World!"
end program hello
```

Save as `hello.f90`, compile and run:

```bash
gfortran -o hello hello.f90
./hello
```

Output: `Hello, World!`

### Side-by-Side Comparison

**QBASIC:**

```basic
PRINT "Hello, World!"
```

**C:**

```c
#include <stdio.h>
int main() {
    printf("Hello, World!\n");
    return 0;
}
```

**PHP:**

```php
<?php echo "Hello, World!"; ?>
```

**JavaScript:**

```javascript
console.log("Hello, World!");
```

**Fortran:**

```fortran
program hello
    implicit none
    print *, "Hello, World!"
end program hello
```

### Key Observations

- `program hello` ... `end program hello` wraps the main code (like `main()` in C, the implicit global scope in QBASIC/PHP, or a top-level JS script).
- `implicit none` - _always write this._ Without it, Fortran uses implicit typing rules (variables starting with I-N are integers; everything else is real). This is a dangerous FORTRAN 77 legacy. `IMPLICIT NONE` turns it off and forces you to declare everything - the opposite of JS's `var`/dynamic typing.
- `print *,` means "print to standard output using default formatting". The `*` means "list-directed format" (Fortran decides the layout). We'll learn explicit formatting later.
- No semicolons. Newline = end of statement.
- Fortran is **case-insensitive** for keywords and variable names. `PROGRAM`, `Program`, and `program` are identical. By convention, modern Fortran uses lowercase keywords.

---

## Chapter 5: Program Structure

### The Anatomy of a Fortran Program

```fortran
program program_name
    use module_name        ! Import modules (like #include / require)
    implicit none          ! ALWAYS include this

    ! Variable declarations
    integer :: i
    real :: x

    ! Executable statements
    i = 10
    x = 3.14
    print *, i, x

end program program_name
```

### Structure Rules

1. **`program` statement** - names the program (optional but strongly recommended).
2. **`use` statements** - come first, before `implicit none`.
3. **`implicit none`** - comes right after `use` statements.
4. **Declarations** - all variable declarations before any executable code (unlike C99/C++ or PHP where you can declare anywhere).
5. **Executable code** - your logic.
6. **`end program`** - closes the program.

> **C Comparison:** Like C89/C90, all declarations must come before executable statements in a given scope. Modern Fortran (2008+) relaxes this slightly in some contexts, but it's best practice to declare at the top.

> **PHP/JS Comparison:** There's no `<?php` tag or module wrapper - Fortran files are always code. Unlike JS, you cannot `let x = 5` anywhere mid-function; declarations come first.

### Comments

```fortran
! This is a comment in Fortran
! Comments start with an exclamation mark and go to end of line
x = 5.0   ! Inline comment

! There are no multi-line comment delimiters
! You just stack ! lines like this
```

**Comparison:**

- QBASIC: `REM comment` or `' comment`
- C: `/* block */` or `// line`
- PHP: `//`, `#`, or `/* */`
- JavaScript: `//` or `/* */`
- Fortran: `!` only

### Line Continuation

```fortran
! A long statement can be split with &
result = very_long_variable_name + another_long_name + &
         yet_another_name + final_value

! & at the END of a line means "continues on next line"
! & at the START of the next line is optional but shows continuation clearly
result = very_long_variable_name + another_long_name + &
         & yet_another_name + final_value
```

**From C:** No backslash continuation needed for statements (only for preprocessor macros in C). In Fortran, `&` handles it.

---

## Chapter 6: Variables, Types, and Declarations

### Basic Types

| Fortran Type       | C Equivalent     | PHP Equivalent | JS Equivalent      | Description            |
| ------------------ | ---------------- | -------------- | ------------------ | ---------------------- |
| `integer`          | `int`            | `int`          | `number` (integer) | Whole numbers          |
| `real`             | `float`          | `float`        | `number`           | Single-precision float |
| `double precision` | `double`         | `float`        | `number`           | Double-precision float |
| `complex`          | (none built-in)  | (none)         | (none)             | Complex numbers        |
| `logical`          | `_Bool` / `bool` | `bool`         | `boolean`          | `.true.` or `.false.`  |
| `character(len=n)` | `char[n]`        | `string`       | `string`           | Fixed-length string    |

> **JS Note:** JavaScript has only one numeric type (`number`, a 64-bit float) plus `BigInt`. Fortran's type system is far richer - you choose the precision explicitly. This is important in numerical work: a Fortran `real` is 32-bit by default, not 64-bit like JS's `number`.

### Declaration Syntax

```fortran
program types_demo
    implicit none

    ! Basic declarations
    integer :: count
    real :: temperature
    double precision :: precise_value
    logical :: is_done
    character(len=20) :: name

    ! Declaration with initialisation
    integer :: score = 0
    real :: pi = 3.14159265358979

    ! Multiple variables of same type
    integer :: i, j, k
    real :: x, y, z

    ! Constants (like C's const)
    real, parameter :: gravity = 9.81
    integer, parameter :: max_size = 100

end program types_demo
```

### Integer Kinds - Controlling Size

In C, you use `int`, `long`, `int32_t`, etc. Fortran has **kinds**:

```fortran
program kinds_demo
    use iso_fortran_env   ! Standard module for kind constants
    implicit none

    integer(kind=int8)  :: tiny_num    ! 8-bit  (-128 to 127)
    integer(kind=int16) :: small_num   ! 16-bit
    integer(kind=int32) :: normal_num  ! 32-bit (default integer)
    integer(kind=int64) :: big_num     ! 64-bit (like long long)

    real(kind=real32)   :: single_val  ! 32-bit float
    real(kind=real64)   :: double_val  ! 64-bit double
    real(kind=real128)  :: quad_val    ! 128-bit quad precision (where supported)

    big_num = 9_000_000_000_int64   ! Underscore separators in literals!

end program kinds_demo
```

> **Tip:** The `_` digit separator in numeric literals (e.g., `1_000_000`) is like Python's convention and aids readability. Fortran has had this longer than most languages.

### Literal Constants

```fortran
! Integer literals
i = 42
i = -7
i = 1_000_000       ! Underscores for readability (Fortran 2008+)

! Real literals
x = 3.14
x = 3.14e0          ! Scientific notation
x = 1.5e-10
x = 3.14_real64     ! Kind-tagged literal (double precision)

! Logical literals
flag = .true.
flag = .false.

! Character literals
name = "Alice"
name = 'Alice'      ! Single or double quotes both work

! Complex literals
z = (1.0, 2.0)      ! Real part 1.0, imaginary part 2.0
```

### The `parameter` Attribute (Constants)

```fortran
real, parameter :: PI = 3.14159265358979323846
integer, parameter :: MAX_ITERATIONS = 1000
character(len=*), parameter :: VERSION = "1.0.0"
```

**From C:** `const` or `#define`. **From PHP:** `define()` or `const`. **From JS:** `const PI = 3.14159...` - same intent, but Fortran's `parameter` is checked at compile time and has no runtime overhead whatsoever.

---

## Chapter 7: Operators and Expressions

### Arithmetic Operators

| Operator       | Fortran | C       | PHP  | JavaScript |
| -------------- | ------- | ------- | ---- | ---------- |
| Addition       | `+`     | `+`     | `+`  | `+`        |
| Subtraction    | `-`     | `-`     | `-`  | `-`        |
| Multiplication | `*`     | `*`     | `*`  | `*`        |
| Division       | `/`     | `/`     | `/`  | `/`        |
| Exponentiation | `**`    | `pow()` | `**` | `**`       |

> **JS/PHP Bonus:** If you're coming from JS (ES2016+) or PHP, you already know `**` for exponentiation. Fortran has had it since 1957 - it's not new. C programmers still need to call `pow()` from `<math.h>`.

```fortran
program arithmetic
    implicit none
    real :: a, b, result

    a = 10.0
    b = 3.0

    result = a + b     ! 13.0
    result = a - b     ! 7.0
    result = a * b     ! 30.0
    result = a / b     ! 3.333...
    result = a ** b    ! 1000.0 (10^3)
    result = a ** 0.5  ! 3.162... (square root)

    print *, result

end program arithmetic
```

### Integer Division Warning!

```fortran
integer :: a = 7, b = 2, result
result = a / b    ! result = 3 (not 3.5!)
```

**This is the same as C.** Integer divided by integer gives integer. The fractional part is truncated. JavaScript programmers beware - JS has no integer division, so `7 / 2` gives `3.5` in JS but `3` in Fortran when both operands are integers.

```fortran
! To get floating-point result:
real :: r
r = real(a) / real(b)   ! r = 3.5 (use real() to convert)
```

### Comparison Operators

Fortran has **two styles** - the old symbolic and the new word-based:

| Meaning          | New Style (Fortran 90+) | Old Style (FORTRAN 77) |
| ---------------- | ----------------------- | ---------------------- |
| Equal            | `==`                    | `.EQ.`                 |
| Not equal        | `/=`                    | `.NE.`                 |
| Less than        | `<`                     | `.LT.`                 |
| Less or equal    | `<=`                    | `.LE.`                 |
| Greater than     | `>`                     | `.GT.`                 |
| Greater or equal | `>=`                    | `.GE.`                 |

**Always use the new style** (`==`, `/=`, `<`, etc.). The old style exists so you can read legacy code.

```fortran
if (x == 0.0) print *, "zero"
if (x /= 0.0) print *, "nonzero"    ! Note: /= not !=
```

> **From C/PHP/JS:** The not-equal operator is `/=` not `!=`. This catches everyone at first. JS and PHP programmers have `!==` / `!=` drilled into their fingers - be ready to retrain that reflex.

### Logical Operators

| Meaning      | Fortran  | C      | PHP    | JavaScript |
| ------------ | -------- | ------ | ------ | ---------- |
| AND          | `.and.`  | `&&`   | `&&`   | `&&`       |
| OR           | `.or.`   | `\|\|` | `\|\|` | `\|\|`     |
| NOT          | `.not.`  | `!`    | `!`    | `!`        |
| Exclusive OR | `.neqv.` | `^`    | `^`    | `^`        |

```fortran
logical :: a = .true., b = .false., result

result = a .and. b    ! .false.
result = a .or. b     ! .true.
result = .not. a      ! .false.
result = a .neqv. b   ! .true. (XOR)
```

---

## Chapter 8: Input and Output

### Basic Output - `print` and `write`

```fortran
! print * - list-directed output to screen
print *, "Hello"
print *, x, y, z
print *, "Value of x =", x

! write - more flexible
write(*, *) "Hello"       ! write to stdout, list-directed
write(*, *) x, y, z
```

The first `*` in `write(*, *)` is the **unit** (output destination). `*` means stdout. The second `*` is the **format**. `*` means list-directed (automatic).

### Formatted Output

```fortran
! Explicit format string
write(*, '(A)') "Hello, World!"             ! A = character string
write(*, '(I5)') 42                          ! I5 = integer, 5 chars wide
write(*, '(F8.3)') 3.14159                   ! F8.3 = float, 8 wide, 3 decimal
write(*, '(E12.4)') 0.00031415              ! E = scientific notation
write(*, '(A, I0, A)') "Count: ", n, " done"  ! I0 = integer, no padding

! Multiple values
write(*, '(A10, F8.2, I5)') "Result:", 3.14, 42
```

**Format codes:**

| Code | Meaning             | Example                           |
| ---- | ------------------- | --------------------------------- |
| `I`  | Integer             | `I5` = 5-wide integer             |
| `F`  | Fixed-point float   | `F8.3` = 8 wide, 3 decimal places |
| `E`  | Scientific notation | `E12.4`                           |
| `G`  | General (F or E)    | `G12.4`                           |
| `A`  | Character string    | `A20` = 20-wide string            |
| `L`  | Logical             | `L5`                              |
| `X`  | Space               | `3X` = 3 spaces                   |
| `/`  | New line            |                                   |

### Basic Input - `read`

```fortran
program input_demo
    implicit none
    integer :: age
    real :: height
    character(len=30) :: username

    print *, "Enter your name:"
    read(*, *) username         ! Read from stdin, list-directed

    print *, "Enter age and height:"
    read(*, *) age, height

    write(*, '(A, A)') "Name: ", trim(username)
    write(*, '(A, I3)') "Age: ", age
    write(*, '(A, F5.1)') "Height: ", height

end program input_demo
```

> **From QBASIC:** `INPUT "prompt"; variable` becomes `print *, "prompt"` followed by `read(*, *) variable`.

> **From C:** No `scanf` format parsing hell. `read(*, *) x` just reads the next value - much more forgiving.

> **From JS:** There's no `prompt()` - Fortran is a console/batch language. All I/O goes through `read` and `write` (or `print`). Think Node.js `readline` rather than browser JS.

### `write` vs `print`

`print *,` is shorthand for `write(*, *),`. They're equivalent. Use `print *,` for quick/simple output. Use `write` when you need format control or non-stdout output.

---

## Chapter 9: Control Flow

### IF Statements

```fortran
! Single-line IF (like QBASIC's IF without THEN block)
if (x > 0) print *, "positive"

! Block IF (use this normally)
if (x > 0) then
    print *, "positive"
end if

! IF-ELSE
if (x > 0) then
    print *, "positive"
else
    print *, "non-positive"
end if

! IF-ELSE IF-ELSE
if (x > 0) then
    print *, "positive"
else if (x < 0) then
    print *, "negative"
else
    print *, "zero"
end if
```

**From C:**

```c
if (x > 0) {
    printf("positive\n");
} else if (x < 0) {
    printf("negative\n");
} else {
    printf("zero\n");
}
```

Fortran uses `then` / `end if` instead of braces `{}`. JavaScript and C use curly braces; Fortran uses keywords - similar to Python's indentation-based approach conceptually, but explicit `then`/`end if` keywords rather than indentation rules.

### SELECT CASE (like switch)

```fortran
integer :: day

select case (day)
case (1)
    print *, "Monday"
case (2)
    print *, "Tuesday"
case (3, 4, 5)
    print *, "Mid-week"
case (6:7)
    print *, "Weekend"     ! Range: 6 to 7
case default
    print *, "Invalid day"
end select
```

> **From C:** No `break` needed! Fortran's `select case` does NOT fall through. Each `case` is independent.

> **From PHP/JS:** Same - no fall-through, unlike C's `switch`. JS's `switch` falls through silently without `break`, which is a notorious bug source. Fortran and PHP are safer here.

```fortran
! SELECT CASE also works on characters and logical
character(len=10) :: color

select case (trim(color))
case ("red")
    print *, "Stop"
case ("green", "blue")
    print *, "Go or sky"
case default
    print *, "Unknown color"
end select
```

### DO Loops (like for/while)

```fortran
! Counted DO loop (like C's for loop)
integer :: i

do i = 1, 10
    print *, i
end do

! With step
do i = 1, 100, 5     ! i = 1, 6, 11, ..., 96
    print *, i
end do

! Count down
do i = 10, 1, -1
    print *, i
end do
```

**C/JS equivalent:**

```c
for (int i = 1; i <= 10; i++) printf("%d\n", i);
for (int i = 1; i <= 100; i += 5) printf("%d\n", i);
```

```javascript
for (let i = 1; i <= 10; i++) console.log(i);
for (let i = 1; i <= 100; i += 5) console.log(i);
```

> **Note:** Fortran's `do i = 1, 10` is cleaner - no semicolons, no init/condition/increment split. The loop variable `i` is also guaranteed to have a defined value after the loop (it equals `n+1` or the first out-of-range value), unlike C where it's technically undefined.

### DO WHILE Loop

```fortran
integer :: n = 1

do while (n <= 100)
    print *, n
    n = n * 2
end do
```

### Infinite Loop with EXIT and CYCLE

```fortran
! Infinite loop
integer :: n = 0

do
    n = n + 1
    if (n == 5) cycle    ! Like C's continue
    if (n > 10) exit     ! Like C's break
    print *, n
end do
```

> **From C/PHP/JS:** `exit` = `break`, `cycle` = `continue`. Same concept, different words.

### Named Loops (powerful for nested loops!)

```fortran
integer :: i, j

outer: do i = 1, 5
    inner: do j = 1, 5
        if (j == 3) cycle outer    ! Cycle the OUTER loop!
        if (i == 4) exit outer     ! Exit the OUTER loop!
        print *, i, j
    end do inner
end do outer
```

> **From C:** C has no named loops - you need flags or `goto` to break out of nested loops. Fortran's named loops are cleaner and safer.

> **From JS:** JavaScript actually _does_ have labeled break/continue (`outer: for(...) { inner: for(...) { break outer; } }`). So this will feel natural - and Fortran's version works the same way, just with `do`/`end do` instead of curly braces.

### GO TO (the infamous one)

```fortran
! GOTO exists but is strongly discouraged in modern Fortran
goto 100
print *, "This is skipped"
100 print *, "Jumped here"
```

**Don't use GOTO.** It exists to support legacy code. In modern Fortran, use structured control flow. You'll only encounter it in FORTRAN 77 code you need to maintain.

---

## Chapter 10: Arrays - Fortran's Superpower

This is where Fortran truly shines. Array operations are central to the language in a way no other language matches at this level.

### Declaring Arrays

```fortran
program arrays_demo
    implicit none

    ! Static arrays
    integer :: a(10)              ! 1D array, indices 1..10
    real :: matrix(3, 4)          ! 2D array, 3 rows x 4 columns
    real :: cube(5, 5, 5)         ! 3D array

    ! Explicit bounds
    integer :: b(-5:5)            ! Indices -5 to 5 (11 elements)
    real :: grid(0:100, 0:100)    ! 0-based (useful for numerical grids)

    ! Initialise with array constructor
    integer :: primes(5) = [2, 3, 5, 7, 11]

end program arrays_demo
```

> **From C/JS:** Both C and JavaScript arrays are 0-based (`a[0]` is the first element). Fortran's 1-based default matches natural mathematical notation - no more `a[i-1]` headaches in numerical code. JS also has no native fixed-type numeric arrays for general use (though `Float64Array`, `Int32Array` etc. exist for performance-critical cases - more on that below).

> **From QBASIC:** `DIM a(10)` is now `integer :: a(10)`. Familiar!

### Accessing Elements

```fortran
integer :: a(5) = [10, 20, 30, 40, 50]
integer :: matrix(3, 3)

! Element access
print *, a(1)        ! 10 (first element - index 1, not 0!)
print *, a(5)        ! 50
print *, a(3)        ! 30

! 2D access
matrix(1, 1) = 1
matrix(2, 3) = 7     ! Row 2, Column 3
```

### Array Sections - Slicing!

This is one of Fortran's greatest features:

```fortran
integer :: a(10) = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

print *, a(3:7)       ! Elements 3,4,5,6,7 → [3,4,5,6,7]
print *, a(1:10:2)    ! Every 2nd element  → [1,3,5,7,9]
print *, a(10:1:-1)   ! Reversed           → [10,9,...,1]
print *, a(:5)        ! First 5            → [1,2,3,4,5]
print *, a(6:)        ! Last 5             → [6,7,8,9,10]

real :: matrix(4, 4)
print *, matrix(2, :)       ! Entire row 2
print *, matrix(:, 3)       ! Entire column 3
print *, matrix(1:2, 1:2)   ! Top-left 2x2 submatrix
```

> **From JS:** JavaScript has `Array.prototype.slice(2, 7)` and modern `array.at(-1)`, but these only work on 1D arrays and return a _copy_. Fortran array sections are more powerful - they work on any number of dimensions, can use step values, and can be used as _assignment targets_ (e.g. `matrix(1:3, 2) = 0.0`). C has nothing like this natively.

### Whole-Array Operations

```fortran
real :: a(1000), b(1000), c(1000)

! Arithmetic on entire arrays at once - no loops needed!
c = a + b          ! Element-wise addition
c = a * b          ! Element-wise multiplication
c = a ** 2         ! Square every element
c = sqrt(a)        ! Square root of every element
c = 2.0 * a + 1.0  ! Linear transform of all elements

! Comparison
logical :: mask(1000)
mask = (a > 0.0)   ! .true. where positive
```

> **From C:** In C you'd need `for(int i=0; i<1000; i++) c[i] = a[i] + b[i];`. Fortran does it in one line - AND the compiler can vectorise/parallelise automatically.

> **From JS:** JavaScript has no built-in element-wise array math. You'd need `.map()` (`c = a.map((v, i) => v + b[i])`) or a library like NumPy-equivalent. Fortran's approach is native, zero-overhead, and the compiler can emit SIMD instructions automatically.

### Array Intrinsic Functions

```fortran
real :: a(5) = [3.0, 1.0, 4.0, 1.0, 5.0]
real :: matrix(3, 3)

print *, sum(a)          ! Sum of all elements: 14.0
print *, product(a)      ! Product: 60.0
print *, maxval(a)       ! Maximum: 5.0
print *, minval(a)       ! Minimum: 1.0
print *, maxloc(a)       ! Index of max: [5]
print *, minloc(a)       ! Index of min: [2] or [4]
print *, size(a)         ! Number of elements: 5
print *, shape(matrix)   ! Shape: [3, 3]

! Sum along a dimension
real :: m(3, 4)
real :: row_sums(3), col_sums(4)
row_sums = sum(m, dim=2)   ! Sum across columns (result per row)
col_sums = sum(m, dim=1)   ! Sum across rows (result per column)
```

### Allocatable Arrays - Dynamic Memory

```fortran
program dynamic_arrays
    implicit none
    real, allocatable :: data(:)      ! 1D, size unknown at compile time
    real, allocatable :: matrix(:,:)  ! 2D
    integer :: n, m

    n = 1000
    allocate(data(n))        ! Like C's malloc
    allocate(matrix(n, n))

    data = 0.0               ! Initialise entire array to zero
    matrix = 1.0

    ! Use the arrays...

    deallocate(data)         ! Like C's free (usually not needed - auto-freed at scope end)
    deallocate(matrix)

end program dynamic_arrays
```

> **From C:** `malloc`/`free` with type casting. Fortran's `allocate`/`deallocate` is type-safe and doesn't need casting.

> **From JS:** JavaScript's `Float64Array`, `Float32Array`, `Int32Array` etc. are the closest analogy - typed, contiguous memory blocks designed for performance. Fortran's allocatable arrays are the same idea but far more integrated into the language: you can slice them, do whole-array arithmetic, pass them to procedures with full type checking, and they free automatically when they go out of scope.

### Array Initialisation

```fortran
! Implied DO loop in array constructor
integer :: squares(10)
squares = [(i**2, i = 1, 10)]    ! [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

! Reshape
real :: flat(9) = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0]
real :: mat(3,3)
mat = reshape(flat, [3, 3])   ! Turn 1D into 3x3 matrix
```

---

## Chapter 11: Subroutines and Functions

Fortran has two kinds of procedures: **subroutines** (no return value, like `void` functions in C) and **functions** (return a value).

### Functions

```fortran
! Function declaration
real function square(x)
    implicit none
    real, intent(in) :: x    ! intent(in) = read-only parameter
    square = x * x           ! Assign to function name to return
end function square

! Modern style with result clause
function cube(x) result(ans)
    implicit none
    real, intent(in) :: x
    real :: ans
    ans = x ** 3
end function cube

! Program using the functions
program func_demo
    implicit none
    real :: square, cube    ! Declare external functions (if not in module)
    print *, square(4.0)   ! 16.0
    print *, cube(3.0)     ! 27.0
end program func_demo
```

> **From C:** In C, `int square(int x) { return x*x; }`. In Fortran, you assign to the function name (or the `result` variable). Modern style with `result(...)` is preferred.

> **From JS:** In JS, `function square(x) { return x * x; }` or `const square = x => x * x`. Fortran has no arrow functions or anonymous functions - all procedures are named and declared explicitly. First-class functions as values don't exist in standard Fortran (though procedure pointers partially fill this role in Fortran 2003+).

### Subroutines

```fortran
! Subroutine - no return value (like void function in C)
subroutine greet(name, times)
    implicit none
    character(len=*), intent(in) :: name    ! len=* = any length
    integer, intent(in) :: times
    integer :: i

    do i = 1, times
        print *, "Hello, ", trim(name), "!"
    end do
end subroutine greet

! Call a subroutine with CALL
program sub_demo
    implicit none
    call greet("Alice", 3)
end program sub_demo
```

> **From C/PHP/JS:** Fortran uses `call subroutine_name(args)` - the `call` keyword is required for subroutines (not needed for functions). In JS/C/PHP you just write `greet("Alice", 3)` for everything; Fortran distinguishes subroutines (use `call`) from functions (no `call` needed).

### Intent Attribute - Safety First

```fortran
subroutine process(a, b, result)
    implicit none
    real, intent(in)  :: a, b      ! Can READ, cannot WRITE
    real, intent(out) :: result    ! Can WRITE, undefined on entry
    real, intent(inout) :: data    ! Can READ and WRITE (like passing by reference)

    result = a + b
end subroutine process
```

| Intent          | C Analogy                   | Meaning                                     |
| --------------- | --------------------------- | ------------------------------------------- |
| `intent(in)`    | `const type param`          | Read-only in procedure                      |
| `intent(out)`   | `type *result` (write-only) | Written by procedure; initial value ignored |
| `intent(inout)` | `type *param`               | Read and write                              |
| _(none)_        | `type *param`               | Fortran decides (avoid this)                |

**Always specify intent.** The compiler can catch bugs and optimise better.

### Passing Arrays to Procedures

```fortran
! Assumed-shape arrays (BEST - Fortran 90+)
subroutine scale_array(a, factor)
    implicit none
    real, intent(inout) :: a(:)    ! Takes array of any size
    real, intent(in) :: factor
    a = a * factor
end subroutine scale_array

! 2D array
subroutine print_matrix(m)
    implicit none
    real, intent(in) :: m(:,:)
    integer :: i, j
    do i = 1, size(m, 1)
        print *, (m(i,j), j = 1, size(m, 2))
    end do
end subroutine print_matrix
```

### Recursive Procedures

```fortran
! Recursion requires the RECURSIVE keyword
recursive function factorial(n) result(ans)
    implicit none
    integer, intent(in) :: n
    integer :: ans

    if (n <= 1) then
        ans = 1
    else
        ans = n * factorial(n - 1)
    end if
end function factorial
```

> **From C/PHP/JS:** No special keyword needed in those languages - any function can call itself. Fortran requires the `recursive` keyword for historical compiler reasons (it affects stack frame allocation). Fortran 2018 made recursion the default, but adding `recursive` explicitly remains good practice for compatibility.

---

## Chapter 12: Modules - The Modern Way

Modules are Fortran's namespace/library system. They replace the old `COMMON` blocks and external function declarations.

```fortran
! File: math_utils.f90
module math_utils
    implicit none
    private              ! All entities private by default
    public :: PI, add, multiply   ! Explicitly expose these

    real, parameter :: PI = 3.14159265358979

contains

    function add(a, b) result(s)
        real, intent(in) :: a, b
        real :: s
        s = a + b
    end function add

    function multiply(a, b) result(p)
        real, intent(in) :: a, b
        real :: p
        p = a * b
    end function multiply

end module math_utils
```

```fortran
! File: main.f90
program use_module
    use math_utils          ! Import everything public
    ! use math_utils, only: PI, add   ! Import specific items
    implicit none

    print *, PI
    print *, add(3.0, 4.0)
    print *, multiply(3.0, 4.0)

end program use_module
```

Compile in order:

```bash
gfortran -c math_utils.f90    # Compile module first
gfortran -c main.f90
gfortran -o main math_utils.o main.o
```

> **From C:** Modules replace `#include` header files + separate `.c` implementation files. Modules are more powerful - they track interfaces automatically and avoid the "multiple inclusion" problem.

> **From PHP:** Like PHP namespaces and `require`/`use` statements, but with proper compile-time type checking.

> **From JS:** ES Modules (`import { add } from './math_utils.js'`) are the closest JS analogy. The mapping is nearly one-to-one: `export` → `public`, no export → `private`, `import { fn }` → `use module, only: fn`, `import *` → `use module`. The key difference is that Fortran modules are compiled to `.mod` files - order of compilation matters, unlike JS which resolves modules dynamically.

### Standard Modules Worth Knowing

```fortran
use iso_fortran_env          ! Kind constants (int32, real64, etc.)
use iso_c_binding            ! C interoperability
use ieee_arithmetic          ! IEEE floating-point control
```

---

## Chapter 13: String Handling

Strings in Fortran are fixed-length by default. Allocatable characters (Fortran 2003+) provide flexibility.

### Fixed-Length Strings

```fortran
program strings_demo
    implicit none
    character(len=20) :: first = "Alice"
    character(len=20) :: last  = "Smith"
    character(len=41) :: full

    ! Concatenation with //
    full = trim(first) // " " // trim(last)
    print *, full   ! "Alice Smith"

    ! String length
    print *, len(first)        ! 20 (allocated length)
    print *, len_trim(first)   ! 5 (actual content, no trailing spaces)

    ! Substrings - like array slicing but for characters
    character(len=10) :: word = "HelloWorld"
    print *, word(1:5)    ! "Hello"
    print *, word(6:10)   ! "World"
    word(1:5) = "Howdy"   ! Modify substring

end program strings_demo
```

### Useful String Intrinsics

```fortran
character(len=30) :: s = "  Hello, World!  "

print *, trim(s)              ! Remove trailing spaces
print *, adjustl(s)           ! Left-adjust (remove leading spaces)
print *, adjustr(s)           ! Right-adjust
print *, len_trim(s)          ! 15 (length without trailing blanks)
print *, index(s, "World")    ! 10 (position of substring)
print *, scan(s, "aeiou")     ! First vowel position
print *, repeat("ab", 3)      ! "ababab"

! Case conversion
character(len=26) :: upper = "HELLO"
! Note: Fortran doesn't have toupper/tolower built-in in all standards
! Use a module or write your own
```

### Allocatable (Variable-Length) Strings

```fortran
program alloc_strings
    implicit none
    character(len=:), allocatable :: dynamic_str

    dynamic_str = "Hello"
    print *, dynamic_str, " - length:", len(dynamic_str)   ! 5

    dynamic_str = dynamic_str // ", World!"    ! Automatically resized
    print *, dynamic_str                        ! "Hello, World!"

end program alloc_strings
```

> **From PHP/JS:** PHP and JS strings are dynamic and easy - `"Hello " . "World"` (PHP) or `` `Hello ${name}!` `` (JS template literals). Fortran's fixed-length strings take adjustment - always use `trim()` when displaying them. Allocatable strings (`character(len=:), allocatable`) give you JS-like flexibility. There are no template literals in Fortran; you concatenate with `//` and format with `write`.

---

## Chapter 14: File I/O

Fortran has a rich, unit-based file I/O system.

### Opening and Closing Files

```fortran
program file_io
    implicit none
    integer :: unit_num = 10   ! Unit number - like a file descriptor
    integer :: ios              ! I/O status (0 = success)

    ! Open a file for writing
    open(unit=10, file="output.txt", status="replace", action="write", iostat=ios)
    if (ios /= 0) then
        print *, "Error opening file!"
        stop
    end if

    write(10, *) "Hello from Fortran!"
    write(10, '(I5, F8.2)') 42, 3.14

    close(10)

    ! Open for reading
    open(unit=20, file="output.txt", status="old", action="read", iostat=ios)

    character(len=100) :: line
    read(20, '(A)', iostat=ios) line
    print *, trim(line)

    close(20)

end program file_io
```

### File Status Options

| `status=`   | Meaning                           | C Analogy |
| ----------- | --------------------------------- | --------- |
| `"new"`     | Create; error if exists           | n/a       |
| `"old"`     | Open existing; error if not found | `"r"`     |
| `"replace"` | Create or overwrite               | `"w"`     |
| `"scratch"` | Temporary file, auto-deleted      | tmpfile() |
| `"unknown"` | Default (old or new)              | -         |

### Action Options

| `action=`     | Meaning    | C Analogy |
| ------------- | ---------- | --------- |
| `"read"`      | Read-only  | `"r"`     |
| `"write"`     | Write-only | `"w"`     |
| `"readwrite"` | Both       | `"r+"`    |

### Reading Until End of File

```fortran
integer :: unit = 15, ios, value
real :: x

open(unit=15, file="data.txt", status="old", action="read")

do
    read(15, *, iostat=ios) x
    if (ios < 0) exit     ! ios < 0 means EOF
    if (ios > 0) then
        print *, "Read error!"
        exit
    end if
    print *, "Read:", x
end do

close(15)
```

### Newunit - Avoid Unit Number Conflicts

```fortran
! Fortran 2008+: Let the compiler pick an available unit number
integer :: myunit
open(newunit=myunit, file="data.txt", status="replace", action="write")
write(myunit, *) "Using automatic unit number"
close(myunit)
```

> **Best practice:** Always use `newunit=` in modern code.

---

## Chapter 15: Pointers and Dynamic Memory

Fortran pointers are different from C pointers. They point to **targets**, not raw memory addresses.

```fortran
program pointers_demo
    implicit none
    real, target :: x = 3.14       ! A variable that can be pointed to
    real, pointer :: p => null()   ! A pointer, initially null

    ! Associate pointer with target
    p => x
    print *, p     ! 3.14 - same as printing x
    p = 10.0       ! Changes x through p
    print *, x     ! 10.0

    ! Pointer with dynamic allocation
    real, pointer :: q
    allocate(q)    ! Allocate memory
    q = 42.0
    print *, q
    deallocate(q)

    ! Check if pointer is associated
    if (associated(p)) print *, "p is associated"
    if (.not. associated(q)) print *, "q is null after deallocate"

    ! Nullify
    nullify(p)

end program pointers_demo
```

> **From C:** C pointers hold memory addresses and you do `*p` to dereference. Fortran pointers automatically dereference - `p` and `x` are interchangeable once `p => x`.

### Array Pointers

```fortran
real, target :: data(100)
real, pointer :: p(:)

p => data          ! p points to all of data
p => data(1:50)    ! p points to first half of data
print *, size(p)   ! 50
```

---

## Chapter 16: Derived Types - Fortran's Structs

Fortran's derived types are equivalent to C structs (and more, when combined with OOP features).

```fortran
module shapes_module
    implicit none

    ! Define a derived type (like a C struct)
    type :: Point
        real :: x = 0.0
        real :: y = 0.0
    end type Point

    type :: Circle
        type(Point) :: centre    ! Nested type
        real :: radius = 1.0
    end type Circle

contains

    function distance(p1, p2) result(d)
        type(Point), intent(in) :: p1, p2
        real :: d
        d = sqrt((p2%x - p1%x)**2 + (p2%y - p1%y)**2)
    end function distance

    function circle_area(c) result(area)
        use iso_fortran_env, only: real64
        type(Circle), intent(in) :: c
        real :: area
        real, parameter :: PI = 3.14159265
        area = PI * c%radius**2
    end function circle_area

end module shapes_module

program struct_demo
    use shapes_module
    implicit none

    type(Point) :: p1, p2
    type(Circle) :: myCircle

    ! Initialise using structure constructor
    p1 = Point(0.0, 0.0)
    p2 = Point(3.0, 4.0)

    ! Access members with % (like C's . for structs, -> for pointers)
    p1%x = 1.0
    p1%y = 2.0

    myCircle = Circle(centre=Point(0.0, 0.0), radius=5.0)

    print *, "Distance:", distance(p1, p2)
    print *, "Area:", circle_area(myCircle)

end program struct_demo
```

> **From C:** `struct.member` becomes `type%member`. The `%` operator is Fortran's member access operator.

> **From JS:** JavaScript objects and classes use `.` for member access (`circle.radius`). Fortran uses `%` - a small but important muscle-memory change. Think of `%` as Fortran's `.` for structured types.

### Arrays of Derived Types

```fortran
type(Point) :: points(100)
integer :: i

do i = 1, 100
    points(i) = Point(real(i), real(i)**2)
end do

print *, points(5)%x, points(5)%y    ! 5.0, 25.0
```

---

## Chapter 17: Object-Oriented Fortran

Fortran 2003 added full OOP support. It's verbose compared to PHP or C++, but powerful.

### Type with Bound Procedures (Methods)

```fortran
module animal_module
    implicit none

    type :: Animal
        character(len=50) :: name
        real :: weight
        integer :: age
    contains
        procedure :: speak => animal_speak     ! Method binding
        procedure :: info  => animal_info
    end type Animal

    ! A derived type that extends Animal (inheritance)
    type, extends(Animal) :: Dog
        character(len=30) :: breed
    contains
        procedure :: speak => dog_speak        ! Override parent method
        procedure :: fetch
    end type Dog

contains

    subroutine animal_speak(self)
        class(Animal), intent(in) :: self      ! class() for polymorphism
        print *, trim(self%name), "says: ..."
    end subroutine animal_speak

    subroutine animal_info(self)
        class(Animal), intent(in) :: self
        print *, "Name:", trim(self%name)
        print *, "Weight:", self%weight, "kg"
        print *, "Age:", self%age, "years"
    end subroutine animal_info

    subroutine dog_speak(self)
        class(Dog), intent(in) :: self
        print *, trim(self%name), "says: Woof!"
    end subroutine dog_speak

    subroutine fetch(self, item)
        class(Dog), intent(in) :: self
        character(len=*), intent(in) :: item
        print *, trim(self%name), "fetches the", trim(item)
    end subroutine fetch

end module animal_module

program oop_demo
    use animal_module
    implicit none

    type(Animal) :: cat
    type(Dog) :: rex

    cat = Animal(name="Whiskers", weight=4.5, age=3)
    rex = Dog(name="Rex", weight=30.0, age=5, breed="Labrador")

    call cat%speak()     ! "Whiskers says: ..."
    call rex%speak()     ! "Rex says: Woof!" (overridden)
    call rex%fetch("ball")
    call rex%info()      ! Inherited from Animal

end program oop_demo
```

### Key OOP Concepts in Fortran

| Concept      | Fortran                     | PHP                   | JavaScript           | C++                  |
| ------------ | --------------------------- | --------------------- | -------------------- | -------------------- |
| Define class | `type :: ClassName`         | `class ClassName {}`  | `class ClassName {}` | `class ClassName {}` |
| Inherit      | `type, extends(Parent) ::`  | `extends ParentClass` | `extends Parent`     | `: public Parent`    |
| Methods      | `contains` + `procedure ::` | `function method()`   | `method() {}`        | `void method()`      |
| Call method  | `obj%method()`              | `$obj->method()`      | `obj.method()`       | `obj.method()`       |
| Polymorphism | `class(Animal)`             | Type hint `Animal $a` | Duck typing          | `Animal* arg`        |
| Constructor  | Structure constructor       | `__construct`         | `constructor()`      | constructor          |

> **JS Note:** JavaScript's prototype-based OOP and Fortran's type-based OOP arrive at similar results differently. JS `class` syntax (ES2015+) is syntactic sugar over prototypes. Fortran types with bound procedures are strictly type-based, similar to C++. One key JS behaviour that doesn't exist in Fortran: you cannot add properties to a Fortran type at runtime (no dynamic property assignment like `obj.newProp = 5`).

### Abstract Types and Interfaces

```fortran
type, abstract :: Shape
contains
    procedure(area_interface), deferred :: area    ! Must be implemented
    procedure(perimeter_interface), deferred :: perimeter
end type Shape

abstract interface
    function area_interface(self) result(a)
        import Shape
        class(Shape), intent(in) :: self
        real :: a
    end function
end interface
```

---

## Chapter 18: Numerical Computing and Intrinsics

This is Fortran's home territory. The built-in mathematical functions are comprehensive.

### Mathematical Intrinsics

```fortran
program math_demo
    use iso_fortran_env, only: real64
    implicit none
    real(real64) :: x = 2.0_real64

    ! Basic math
    print *, abs(x)        ! Absolute value
    print *, sqrt(x)       ! Square root: 1.4142...
    print *, exp(x)        ! e^x: 7.389...
    print *, log(x)        ! Natural log: 0.693...
    print *, log10(x)      ! Base-10 log: 0.301...

    ! Trig (arguments in radians)
    real(real64), parameter :: PI = acos(-1.0_real64)
    print *, sin(PI/2)     ! 1.0
    print *, cos(0.0)      ! 1.0
    print *, tan(PI/4)     ! 1.0
    print *, asin(1.0)     ! PI/2
    print *, acos(0.0)     ! PI/2
    print *, atan(1.0)     ! PI/4
    print *, atan2(1.0, 1.0)  ! PI/4 (safer atan with quadrant info)

    ! Rounding
    print *, floor(3.7)    ! 3.0
    print *, ceiling(3.2)  ! 4.0
    print *, nint(3.5)     ! 4 (nearest integer)
    print *, int(3.9)      ! 3 (truncate toward zero)

    ! Type conversion
    integer :: n = 7
    real :: r = real(n)      ! int to real
    integer :: m = int(3.9)  ! real to int (truncate)
    print *, r, m

end program math_demo
```

### Generating Acos-Based PI (Best Practice)

```fortran
real(real64), parameter :: PI = acos(-1.0_real64)
```

This is the idiomatic way to get π to full machine precision in Fortran.

### Bit Manipulation

```fortran
integer :: a = 12, b = 10  ! 1100, 1010 in binary

print *, iand(a, b)   ! AND: 1000 = 8
print *, ior(a, b)    ! OR:  1110 = 14
print *, ieor(a, b)   ! XOR: 0110 = 6
print *, not(a)       ! Bitwise NOT
print *, ishft(a, 2)  ! Left shift 2: 48
print *, ishft(a,-1)  ! Right shift 1: 6
print *, btest(a, 3)  ! Test bit 3: .true. (12 = 1100)
```

### Random Numbers

```fortran
program random_demo
    implicit none
    real :: r
    real :: array(1000)
    integer :: seed(1)

    ! Seed (optional)
    seed = [42]
    call random_seed(put=seed)

    ! Single random number [0.0, 1.0)
    call random_number(r)
    print *, r

    ! Fill entire array with randoms
    call random_number(array)
    print *, sum(array) / 1000.0   ! ≈ 0.5
end program random_demo
```

---

## Chapter 19: Parallelism

One of Fortran's modern strengths is built-in and standard parallel programming.

### OpenMP (Shared-Memory Parallelism)

```fortran
program openmp_demo
    use omp_lib           ! OpenMP module
    implicit none
    integer :: i, n = 1000000
    real :: total = 0.0

    !$omp parallel do reduction(+:total)
    do i = 1, n
        total = total + sin(real(i))
    end do
    !$omp end parallel do

    print *, "Total:", total
    print *, "Threads used:", omp_get_max_threads()

end program openmp_demo
```

Compile with:

```bash
gfortran -fopenmp -O3 -o parallel openmp_demo.f90
```

### Coarrays (Fortran 2008 - Built-in Distributed Memory)

```fortran
program coarray_demo
    implicit none
    integer :: data[*]   ! Coarray - one copy per image (process)

    data = this_image()  ! Each image sets its own value

    ! Barrier sync
    sync all

    ! Image 1 reads from image 2
    if (this_image() == 1) then
        print *, "Image 2 has:", data[2]
    end if

end program coarray_demo
```

Compile and run with multiple images:

```bash
gfortran -fcoarray=lib -o coarray_demo coarray_demo.f90 -lcaf_mpi
mpirun -n 4 ./coarray_demo
```

### Do Concurrent (Fortran 2008 - Hint to Parallelise)

```fortran
real :: a(1000), b(1000)
call random_number(a)

! Tell the compiler these iterations are independent - can be parallel
do concurrent (i = 1:1000, a(i) > 0.5)
    b(i) = sqrt(a(i))
end do
```

---

## Chapter 20: Interoperability with C

Fortran and C are natural partners. Scientific code often mixes both.

### Calling a C Function from Fortran

**C side (mylib.c):**

```c
#include <stdio.h>

void c_greet(const char *name, int name_len) {
    printf("Hello from C, %.*s!\n", name_len, name);
}

double c_square(double x) {
    return x * x;
}
```

**Fortran side:**

```fortran
module c_interface
    use iso_c_binding
    implicit none

    interface
        subroutine c_greet(name, name_len) bind(C, name="c_greet")
            use iso_c_binding
            character(kind=c_char), intent(in) :: name(*)
            integer(c_int), value :: name_len
        end subroutine

        function c_square(x) result(y) bind(C, name="c_square")
            use iso_c_binding
            real(c_double), value :: x
            real(c_double) :: y
        end function
    end interface

end module c_interface

program interop_demo
    use c_interface
    use iso_c_binding
    implicit none

    character(len=10) :: name = "Alice"
    real(c_double) :: result

    call c_greet(name, int(len_trim(name), c_int))
    result = c_square(3.0_c_double)
    print *, "Square:", result   ! 9.0

end program interop_demo
```

Compile and link:

```bash
gcc -c mylib.c
gfortran -o interop interop_demo.f90 mylib.o
```

### C Kind Constants

| Fortran                  | C equivalent |
| ------------------------ | ------------ |
| `integer(c_int)`         | `int`        |
| `integer(c_long)`        | `long`       |
| `integer(c_size_t)`      | `size_t`     |
| `real(c_float)`          | `float`      |
| `real(c_double)`         | `double`     |
| `character(kind=c_char)` | `char`       |
| `logical(c_bool)`        | `_Bool`      |

---

## Chapter 21: Common Pitfalls and Gotchas

Every experienced Fortran programmer has tripped on these. Learn from their pain.

### 1. Forgetting `IMPLICIT NONE`

```fortran
! BAD - implicit typing
program bad
    x = 3.14   ! x is implicitly REAL (starts with a non-I-N letter)
    n = 5      ! n is implicitly INTEGER (starts with N)
    ! No errors but extremely confusing and bug-prone
end program bad

! GOOD
program good
    implicit none
    real :: x
    integer :: n
    x = 3.14
    n = 5
end program good
```

### 2. Integer Division Surprise

```fortran
real :: r
r = 1/3     ! r = 0.0 !! (1 and 3 are INTEGER literals)
r = 1.0/3   ! r = 0.333... (one real literal forces real division)
r = 1/3.0   ! r = 0.333...
r = real(1)/real(3)  ! r = 0.333...
```

### 3. Array Index Out of Bounds (Silent!)

```fortran
! By default, gfortran does NOT check array bounds at runtime
! Enable with: gfortran -fbounds-check
integer :: a(10)
a(11) = 5    ! Undefined behaviour! No error by default.
```

**Always develop with `-fbounds-check` or `-fcheck=all`:**

```bash
gfortran -fcheck=all -Wall -g -o prog prog.f90
```

### 4. Column-Fixed Format in .f90 Files

```fortran
! WRONG in free-format .f90 files:
      PROGRAM OLDSTYLE     ! Old 6-column indent - technically allowed but ugly
C This is a comment        ! C in column 1 is a comment in fixed-format only

! RIGHT in free-format:
program newstyle
! This is a comment
```

### 5. The `/=` Not-Equal Operator

```fortran
! From C/PHP/JS: if (x != 0) ...   or   if (x !== 0) ...
! Fortran:
if (x /= 0) ...    ! /= not !=
```

> **JS double-whammy:** JavaScript programmers use both `!=` and `!==`. Neither exists in Fortran. It's `/=` - full stop. Expect to make this mistake at least three times before it sticks.

### 6. Floating-Point Equality

```fortran
! Never do this:
if (x == 0.0) ...         ! Floating-point equality is unreliable

! Do this:
real, parameter :: EPS = 1.0e-10
if (abs(x) < EPS) ...     ! Check if close enough to zero
```

### 7. Substring vs Array Element

```fortran
character(len=10) :: s = "HelloWorld"
integer :: a(10)

print *, s(1:5)    ! "Hello" - SUBSTRING (1 to 5)
print *, a(1)      ! First ELEMENT of integer array

! These look similar but are completely different!
```

### 8. Assumed-Size Arrays in Old Code

```fortran
! OLD STYLE (FORTRAN 77) - don't write this:
subroutine old(a, n)
    integer n
    real a(n)   ! Explicit size - must pass n separately
end subroutine

! MODERN STYLE - use this:
subroutine modern(a)
    real, intent(inout) :: a(:)   ! Assumed shape - size() works inside
end subroutine
```

### 9. `stop` vs `error stop`

```fortran
stop        ! Normal termination (exit code 0)
stop "Error message"   ! Terminates with a message
error stop  ! Fortran 2008+: error termination (like exit(1) in C)
error stop "Critical error occurred"
```

### 10. Modules Must Be Compiled First

Fortran modules produce `.mod` files. If you compile in the wrong order, you'll get errors.

```bash
# Compile modules first, then files that use them
gfortran -c physics_constants.f90    # produces physics_constants.mod
gfortran -c simulation.f90           # uses physics_constants - must be after
gfortran -o sim simulation.o physics_constants.o
```

Use a build system (`make` or `CMake`) for anything non-trivial.

---

## Chapter 22: Real-World Project - Numerical Simulation

Let's put it all together with a real scientific program: simulating the trajectory of a projectile under gravity.

```fortran
! File: projectile.f90
module physics
    use iso_fortran_env, only: real64
    implicit none
    private
    public :: dp, g, PI, simulate_trajectory, print_results

    integer, parameter :: dp = real64
    real(dp), parameter :: g   = 9.81_dp   ! m/s^2
    real(dp), parameter :: PI  = acos(-1.0_dp)

    type, public :: TrajectoryPoint
        real(dp) :: t, x, y, vx, vy
    end type TrajectoryPoint

contains

    subroutine simulate_trajectory(v0, angle_deg, dt, points, n_points)
        real(dp), intent(in)  :: v0, angle_deg, dt
        type(TrajectoryPoint), allocatable, intent(out) :: points(:)
        integer, intent(out) :: n_points

        real(dp) :: angle, vx0, vy0, t, x, y, vx, vy
        integer :: i, max_points
        type(TrajectoryPoint), allocatable :: temp(:)

        angle = angle_deg * PI / 180.0_dp
        vx0 = v0 * cos(angle)
        vy0 = v0 * sin(angle)

        max_points = int(2.0_dp * vy0 / g / dt) + 10
        allocate(temp(max_points))

        t = 0.0_dp;  x = 0.0_dp;  y = 0.0_dp
        vx = vx0;    vy = vy0
        i = 1

        do while (y >= 0.0_dp .and. i <= max_points)
            temp(i) = TrajectoryPoint(t=t, x=x, y=y, vx=vx, vy=vy)
            t  = t  + dt
            x  = x  + vx * dt
            y  = y  + vy * dt - 0.5_dp * g * dt**2
            vy = vy - g * dt
            i  = i + 1
        end do

        n_points = i - 1
        allocate(points(n_points))
        points = temp(1:n_points)

    end subroutine simulate_trajectory

    subroutine print_results(points, n_points)
        type(TrajectoryPoint), intent(in) :: points(:)
        integer, intent(in) :: n_points
        integer :: i
        real(dp) :: max_height, max_range

        max_height = maxval(points%y)    ! Fortran array component slicing!
        max_range  = maxval(points%x)

        write(*, '(A)') "=== Projectile Simulation Results ==="
        write(*, '(A, F8.2, A)') "Max height: ", max_height, " m"
        write(*, '(A, F8.2, A)') "Max range:  ", max_range,  " m"
        write(*, '(A, F8.2, A)') "Flight time:", points(n_points)%t, " s"
        write(*, '(A)') ""
        write(*, '(A5, A10, A10, A10, A10)') "Step", "Time(s)", "X(m)", "Y(m)", "Vy(m/s)"

        ! Print every 10th point
        do i = 1, n_points, max(1, n_points/20)
            write(*, '(I5, 4F10.2)') i, points(i)%t, points(i)%x, &
                                        points(i)%y, points(i)%vy
        end do
    end subroutine print_results

end module physics


program projectile_sim
    use physics
    implicit none

    type(TrajectoryPoint), allocatable :: traj(:)
    integer :: n
    real(dp) :: v0, angle

    write(*, '(A)') "Projectile Motion Simulator"
    write(*, '(A)', advance="no") "Initial velocity (m/s) [default 50]: "
    read(*, *, err=10, end=10) v0
    goto 20
10  v0 = 50.0_dp
20  write(*, '(A)', advance="no") "Launch angle (degrees) [default 45]: "
    read(*, *, err=30, end=30) angle
    goto 40
30  angle = 45.0_dp
40  continue

    write(*, '(A, F6.1, A, F5.1, A)') "Simulating: v0=", v0, " m/s, angle=", angle, " deg"

    call simulate_trajectory(v0=v0, angle_deg=angle, dt=0.01_dp, &
                              points=traj, n_points=n)

    call print_results(traj, n)

    ! Save to file
    block
        integer :: fu
        integer :: i
        open(newunit=fu, file="trajectory.csv", status="replace", action="write")
        write(fu, '(A)') "t,x,y,vx,vy"
        do i = 1, n
            write(fu, '(5(F10.4, :, ","))') traj(i)%t, traj(i)%x, traj(i)%y, &
                                              traj(i)%vx, traj(i)%vy
        end do
        close(fu)
    end block

    write(*, '(A)') "Results saved to trajectory.csv"

end program projectile_sim
```

Compile and run:

```bash
gfortran -O2 -Wall -o projectile projectile.f90
./projectile
```

This project demonstrates:

- Modules with `private`/`public`
- Derived types (`TrajectoryPoint`)
- Allocatable arrays
- Double precision with `real64`
- Array intrinsics (`maxval`, component array operations)
- Formatted I/O
- File output
- `block` construct (Fortran 2008)
- `newunit=`

---

## Chapter 23: Going Further - Resources and Next Steps

### Topics to Explore Next

**Advanced Numerics:**

- LAPACK/BLAS libraries (linear algebra)
- FFTW (Fast Fourier Transform)
- GNU Scientific Library with C interop

**High-Performance Computing:**

- MPI (Message Passing Interface) for distributed computing
- OpenMP advanced directives
- GPU programming with OpenACC and CUDA Fortran

**Modern Language Features:**

- Submodules (Fortran 2008) - for large projects
- Generic programming with `class(*)`
- IEEE arithmetic control
- Parallel I/O

**Build Systems:**

- `make` with Fortran dependency tracking
- `CMake` with `FortranProject`
- `meson` (excellent Fortran support)
- `fpm` - Fortran Package Manager

### Recommended Resources

**Books:**

- _Modern Fortran Explained_ - Metcalf, Reid, Cohen (the definitive reference)
- _Introduction to Programming with Fortran_ - Chivers & Sleightholme
- _Numerical Recipes in Fortran_ - Press et al. (numerical algorithms)

**Online:**

- [fortran-lang.org](https://fortran-lang.org) - Modern Fortran community hub
- [Fortran Discourse](https://fortran-lang.discourse.group) - Active community forum
- [J3 Fortran Standard Documents](https://j3-fortran.org)
- [Rosetta Code - Fortran](https://rosettacode.org/wiki/Category:Fortran)

**Practice:**

- [Exercism Fortran Track](https://exercism.org/tracks/fortran)
- [Project Euler](https://projecteuler.net) - Mathematical problems, excellent for Fortran

### Final Cheat Sheet: Mapping Your Knowledge

| Concept              | C                    | PHP                  | JavaScript           | Fortran                             |
| -------------------- | -------------------- | -------------------- | -------------------- | ----------------------------------- |
| Import library       | `#include <h>`       | `require`/`use`      | `import ... from`    | `use module_name`                   |
| Declare variable     | `int x;`             | `$x = ...`           | `let x`              | `integer :: x`                      |
| Constant             | `const double PI`    | `define('PI',...)`   | `const PI = ...`     | `real(real64), parameter :: PI`     |
| Print                | `printf("%.2f", x)`  | `echo`               | `console.log(x)`     | `write(*, '(F8.2)') x`              |
| Read input           | `scanf("%d", &n)`    | `fgets` / `readline` | `readline` (Node)    | `read(*, *) n`                      |
| Array element        | `a[i]` (0-based)     | `$a[i]` (0-based)    | `a[i]` (0-based)     | `a(i)` (1-based)                    |
| Struct/object member | `s.member`           | `$obj->member`       | `obj.member`         | `type%member`                       |
| For loop             | `for(i=0;i<n;i++)`   | `for($i=0;...)`      | `for(let i=0;...)`   | `do i = 1, n`                       |
| While loop           | `while (cond)`       | `while (cond)`       | `while (cond)`       | `do while (cond)`                   |
| break / continue     | `break` / `continue` | `break` / `continue` | `break` / `continue` | `exit` / `cycle`                    |
| Dynamic array        | `malloc` / `free`    | automatic            | `new Array(n)`       | `allocate` / `deallocate`           |
| Not-equal            | `!=`                 | `!=` / `!==`         | `!=` / `!==`         | `/=`                                |
| Logical AND/OR/NOT   | `&&` `\|\|` `!`      | `&&` `\|\|` `!`      | `&&` `\|\|` `!`      | `.and.` `.or.` `.not.`              |
| Exponentiation       | `pow(x,2)`           | `x**2`               | `x**2`               | `x**2`                              |
| Void function        | `void func()`        | `function f()`       | `function f()`       | `subroutine func()` + `call func()` |
| Return value         | `return value;`      | `return value;`      | `return value;`      | `func_name = value`                 |
| Comment              | `//` or `/* */`      | `//` `#` `/* */`     | `//` or `/* */`      | `!`                                 |
| String concat        | `strcat`             | `.`                  | `+` or template lit  | `//`                                |

---

> **You've reached the end of the guide.** You went from a blank page to Fortran 2018 features, OOP, parallelism, and a working physics simulation. The language that powers climate models, spacecraft trajectory calculations, and quantum chemistry simulations is now in your toolkit. Write fast, write correct, and write modern Fortran.

---

_FORTRAN Guide for Students Who Already Know QBASIC, C, PHP, and JavaScript_
_Version 2.0 - Covering Fortran 90 through Fortran 2018_
