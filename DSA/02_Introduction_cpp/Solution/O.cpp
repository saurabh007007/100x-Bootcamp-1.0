#include <bits/stdc++.h>
 
using namespace std;
 
 
 
int main() {
    int A, B;
    cin >> A >> B;
    
    if (A < B) {
        cout << "Min = " << A << " "<< endl;
        cout << "Max = " << B << " " << endl;
    } else {
        cout << "Min = " << B << " "<< endl;
        cout << "Max = " << A << " "<< endl;
    }
    
    return 0;
}