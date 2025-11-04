# Professional C++

## Part I : Introduction to Professional C++

### 1 A Crash Course in C++ and the Standard Library

#### P.41

main函数要么没有参数，要么有两个参数：

```C++
int main(int argc, char** argv)
```

需要注意的是，argv[0]可能是程序名，也可能是空字符串，应该使用平台特定的函数来获取程序名。

#### P.43

`std::endl`和`\n`的区别在于，`std::endl`在流中插入新行时会清空buffer缓冲区，而`\n`不会。频繁使用`std::endl`开销成本大。

#### P.45

命名空间别名：

```C++
namespace MyFTP = MyLibraries::Networking::FTP;
```

#### P.49

C++中同样可以使用C中的常量来获取数值极限，如`INT_MAX`。但是在C++中更推荐使用`<limits>`中的模版`std::numeric_limits`。如：

```C++
println("int:");
println("Max int value: {}", numeric_limits<int>::max());
println("Min int value: {}", numeric_limits<int>::min());
println("Lowest int value: {}", numeric_limits<int>::lowest());

println("\ndouble:");
println("Max double value: {}", numeric_limits<double>::max());
println("Min double value: {}", numeric_limits<double>::min());
println("Lowest double value: {}", numeric_limits<double>::lowest());
```

需要注意，对于整数来说，`min()`和`lowest()`结果相同；但是对于浮点数来说，`min()`结果为可以表示的最小正数，而`lowest()`结果为可以表示的最小负数。

#### P.54

运算符优先级

```cmd
1. ++ −− // postfix, 后缀
2. ! ++ −− // prefix, 前缀
3. * / %
4. + −
5. << >>
6. &
7. ^
8. |
9. = += -= *= /= %= &= |= ^= <<= >>=
```
