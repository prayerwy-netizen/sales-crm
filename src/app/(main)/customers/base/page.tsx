'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchInput, Badge, Select } from '@/components/ui';
import { ChevronLeft, ChevronRight, Database, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { BaseCustomer } from '@/types/customer';

const PAGE_SIZE = 100;

const gradeColors: Record<string, 'red' | 'orange' | 'blue' | 'gray' | 'green'> = {
  A: 'red',
  B: 'orange',
  C: 'blue',
  D: 'gray',
};

const provinceOptions = [
  { value: '', label: '全部省份' },
  { value: '山西省', label: '山西省' },
  { value: '贵州省', label: '贵州省' },
  { value: '内蒙古自治区', label: '内蒙古自治区' },
  { value: '山东省', label: '山东省' },
  { value: '河南省', label: '河南省' },
  { value: '陕西省', label: '陕西省' },
  { value: '云南省', label: '云南省' },
  { value: '湖南省', label: '湖南省' },
  { value: '四川省', label: '四川省' },
  { value: '安徽省', label: '安徽省' },
  { value: '河北省', label: '河北省' },
  { value: '甘肃省', label: '甘肃省' },
  { value: '新疆维吾尔自治区', label: '新疆维吾尔自治区' },
  { value: '黑龙江省', label: '黑龙江省' },
  { value: '辽宁省', label: '辽宁省' },
  { value: '江苏省', label: '江苏省' },
  { value: '北京市', label: '北京市' },
];

const businessTypeOptions = [
  { value: '', label: '全部行业' },
  { value: '煤炭', label: '煤炭' },
  { value: '非煤矿山', label: '非煤矿山' },
  { value: '政府监管', label: '政府监管' },
  { value: '其他（教育等）', label: '其他（教育等）' },
  { value: '危化行业（燃气、消防、中石油等）', label: '危化行业' },
  { value: '保险', label: '保险' },
];

const customerTypeOptions = [
  { value: '', label: '全部类型' },
  { value: '终端客户', label: '终端客户' },
  { value: '经销商', label: '经销商' },
  { value: '总集成商', label: '总集成商' },
];

const gradeOptions = [
  { value: '', label: '全部等级' },
  { value: 'A', label: 'A级' },
  { value: 'B', label: 'B级' },
  { value: 'C', label: 'C级' },
  { value: 'D', label: 'D级' },
];

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function BaseCustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [grade, setGrade] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<BaseCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));
    if (search) params.set('search', search);
    if (province) params.set('province', province);
    if (businessType) params.set('businessType', businessType);
    if (customerType) params.set('customerType', customerType);
    if (grade) params.set('grade', grade);

    try {
      const res = await fetch(`/api/base-customers?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, province, businessType, customerType, grade]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, province, businessType, customerType, grade]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-800">基础客户库</h2>
          <span className="text-sm text-slate-400">共 {total.toLocaleString()} 条</span>
        </div>
      </div>

      <div className="glass-card p-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="搜索客户名称..."
            className="w-64"
          />
          <div className="w-36">
            <Select
              options={provinceOptions}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              options={businessTypeOptions}
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          <div className="w-36">
            <Select
              options={customerTypeOptions}
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
            />
          </div>
          <div className="w-28">
            <Select
              options={gradeOptions}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="ml-2 text-sm text-slate-400">加载中...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">客户名称</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 w-20">省份</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 w-20">城市</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 w-24">行业</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 w-24">客户类型</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 w-16">等级</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 w-16">信用分</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">实际控制人</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/customers/base/${row.id}`)}
                    className="border-b border-slate-100 cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{row.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.province?.replace(/省|市|自治区|壮族|维吾尔|回族/, '') || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.city?.replace('市', '') || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.businessType || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{row.customerType || '-'}</td>
                    <td className="px-4 py-3">
                      {row.customerGrade ? (
                        <Badge variant={gradeColors[row.customerGrade] || 'gray'}>
                          {row.customerGrade}
                        </Badge>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.creditScore ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{row.actualController || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
            <span className="text-sm text-slate-400">
              共 {total.toLocaleString()} 条，第 {page}/{totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`dot-${i}`} className="px-2 text-sm text-slate-400">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`min-w-[32px] h-8 rounded-lg text-sm transition-colors ${
                      page === p
                        ? 'bg-primary text-white font-medium'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
