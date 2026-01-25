#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    if (n == 1) {
        cout << "*\n";
        return 0;
    }
    
    for (int j = 1; j < n; j++) cout << " ";
    cout << "*\n";
    
    for (int i = 2; i < n; i++) {
        for (int j = 1; j <= n - i; j++) cout << " ";
        
        cout << "*";
        
        for (int j = 1; j <= 2*i - 3; j++) cout << " ";
        
        cout << "*\n";
    }
    
    if (n > 1) {
        for (int i = 1; i <= n; i++) {
            cout << "*";
            if (i < n) cout << " ";
        }
        cout << endl;
    }
    
    return 0;
}