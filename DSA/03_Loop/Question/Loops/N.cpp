#include <bits/stdc++.h>
using namespace std;


int main(){

    long long n;
    cin>>n;
    long long k=n;

    long long  sum=0;
    while(n!=0){
        sum=(sum*10)+n%10;
        n=n/10;
    }

    if(k==sum){
        cout<<"YES";
    }else{
        cout<<"NO";
    }
    return 0;
    }
