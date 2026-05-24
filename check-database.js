#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

// Script untuk memeriksa struktur database Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wazgngraowkufklzggfn.supabase.co';
const supabaseKey = 'sb_publishable_yfZjc9-_QUNO9b9JyGV-mQ_Hqmi27XM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('=== Memeriksa Struktur Database Supabase ===\n');

  try {
    // 1. Cek apakah tabel statistik ada
    console.log('1. Memeriksa tabel "statistik"...\n');
    const { data: statistikData, error: statistikError } = await supabase
      .from('statistik')
      .select('*')
      .limit(5);

    if (statistikError) {
      console.log('❌ Error mengakses tabel statistik:');
      console.log('   Error:', statistikError.message);
      console.log('   Code:', statistikError.code);
      console.log('\n➡️  KESIMPULAN: Tabel "statistik" mungkin BELUM ADA atau tidak dapat diakses.');
    } else {
      console.log('✅ Tabel "statistik" DITEMUKAN!');
      console.log('\n2. Struktur Data Statistik:');
      
      if (statistikData && statistikData.length > 0) {
        const firstRow = statistikData[0];
        console.log('   Kolom yang ditemukan:');
        Object.keys(firstRow).forEach((key) => {
          console.log(`   - ${key}: ${typeof firstRow[key]} = ${JSON.stringify(firstRow[key])}`);
        });
        
        console.log('\n3. Jumlah Data di Tabel Statistik:');
        const { count, error: countError } = await supabase
          .from('statistik')
          .select('*', { count: 'exact' });
        
        if (countError) {
          console.log('   ⚠️  Tidak dapat menghitung total data:', countError.message);
        } else {
          console.log(`   Total: ${count} baris data`);
        }

        console.log('\n4. Semua Data Statistik:');
        const { data: allData } = await supabase
          .from('statistik')
          .select('*');
        
        allData.forEach((item, idx) => {
          console.log(`\n   Record ${idx + 1}:`);
          Object.entries(item).forEach(([key, value]) => {
            console.log(`     ${key}: ${JSON.stringify(value)}`);
          });
        });
      } else {
        console.log('   ⚠️  Tabel ada tetapi KOSONG (tidak ada data).');
      }
    }

    // Cek tabel lainnya
    console.log('\n\n=== Cek Tabel Lainnya ===\n');
    
    const tables = ['berita', 'kegiatan', 'galeri', 'users'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`⚠️  ${table}: Error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Ada ${data ? '(dapat diakses)' : '(kosong)'}`);
      }
    }

  } catch (error) {
    console.error('Fatal Error:', error.message);
  }
}

checkDatabase();
