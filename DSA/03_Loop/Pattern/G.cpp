#include <bits/stdc++.h>
using namespace std;

int main() {
    int rows, cols;
    cin >> rows >> cols;
    
    // Edge cases
    if (rows <= 0 || cols <= 0) {
        cout << "Invalid dimensions\n";
        return 0;
    }
    
    // Single row/col rectangle
    if (rows == 1 || cols == 1) {
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                cout << "*";
            }
            cout << endl;
        }
        return 0;
    }
    
    // Print top row
    for (int j = 0; j < cols; j++) {
        cout << "*";
    }
    cout << endl;
    
    // Print middle rows
    for (int i = 1; i < rows - 1; i++) {
        cout << "*";
        for (int j = 1; j < cols - 1; j++) {
            cout << " ";
        }
        cout << "*\n";
    }
    
    // Print bottom row
    for (int j = 0; j < cols; j++) {
        cout << "*";
    }
    cout << endl;
    
    return 0;
}