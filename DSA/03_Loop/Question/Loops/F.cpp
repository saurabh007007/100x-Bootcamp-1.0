#include <bits/stdc++.h>
using namespace std;


int main(){
    int t;
    int p=0;
    int n=0;
    int e=0;
    int o=0;
    cin>>t;
    while(t--){
        int k;
        cin>>k;
        if(k>0){
            p++;
        }
        if(k%2==0 ){
            e++;
        }
        if(k<0){
            n++;
        }
        if(k%2!=0){
            o++;
        }

    }
    cout<<p<<endl;
    cout<<n<<endl;
    cout<<e<<endl;
    cout<<o<<endl;
}
