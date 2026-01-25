#include <bits/stdc++.h>
using namespace std;


int main(){
    int n,b;
    cin>>n>>b;
    long long fact=1;
    for(int i=1;i<=b;i++){
        fact*=n;

    }
    cout<< fact;
    return 0;
}
