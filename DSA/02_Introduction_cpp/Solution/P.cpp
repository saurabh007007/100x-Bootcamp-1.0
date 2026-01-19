#include <bits/stdc++.h>
 
using namespace std;
 
 
 
int main() {
    int A, B, C;
    cin >> A >> B >> C;
    
    int minimum, maximum;
    
   
    if (A <= B && A <= C)
        minimum = A;
    else if (B <= A && B <= C)
        minimum = B;
    else
        minimum = C;
    
 
    if (A >= B && A >= C)
        maximum = A;
    else if (B >= A && B >= C)
        maximum = B;
    else
        maximum = C;
    
    cout << "Min = " << minimum <<" "<< endl;
    cout << "Max = " << maximum <<" "<< endl;
    
    return 0;
}