require('dotenv').config();
const fetch = global.fetch || require('node-fetch');
(async()=>{
  const base='http://localhost:4000';
  let r=await fetch(base+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'customer@example.com',password:'custpass'})});
  const j=await r.json();
  const token=j.token;
  console.log('login status',r.status);
  r=await fetch(base+'/api/wishlist',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},body:JSON.stringify({product_id:'6a1c6f88616ec6902d457243'})});
  console.log('wishlist post status', r.status);
  console.log(await r.json());
  r=await fetch(base+'/api/wishlist',{method:'GET',headers:{'Authorization':`Bearer ${token}`}});
  console.log('wishlist get status', r.status);
  console.log(await r.json());
})().catch(err=>{console.error(err);process.exit(1);});
