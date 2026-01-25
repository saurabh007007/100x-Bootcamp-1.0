#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    if (n == 1) {
        cout << "*\n";
        return 0;
    }
    
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i; j++) cout << " ";
        
        if (i == 1) {
            cout << "*";
        } else {
            cout << "*";
            for (int j = 1; j <= 2*i - 3; j++) cout << " ";
            cout << "*";
        }
        cout << endl;
    }
    
    for (int i = n - 1; i >= 1; i--) {
        for (int j = 1; j <= n - i; j++) cout << " ";
        
        if (i == 1) {
            cout << "*";
        } else {
            cout << "*";
            for (int j = 1; j <= 2*i - 3; j++) cout << " ";
            cout << "*";
        }
        cout << endl;
    }
    
    return 0;
}