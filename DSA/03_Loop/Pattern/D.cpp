#include <bits/stdc++.h>
using namespace std;
 
int main() {
    int t;
    cin >> t;
    
    for (int i = t; i >0 ; i--) {
        for (int j = 1; j <= i; j++) {
            cout << "*";
        }
        cout << "\n";
    }
    
    return 0;
}