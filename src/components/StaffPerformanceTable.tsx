import React, { useState, useRef, useEffect } from 'react';

interface StaffMember {
  id: number;
  name: string;
  avatar: string;
  revenue: number;
  cost: number;
  conversionRate: number;
  adsPercentage: number;
  ctr: number;
  cvr: number;
  cpa: number;
}

const StaffPerformanceTable: React.FC = () => {
  // Dữ liệu mẫu
  const staffData: StaffMember[] = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      revenue: 352680000,
      cost: 58560000,
      conversionRate: 9.8,
      adsPercentage: 16.6,
      ctr: 2.45,
      cvr: 4.12,
      cpa: 58000
    },
    {
      id: 2,
      name: 'Trần Thị B',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      revenue: 286450000,
      cost: 41230000,
      conversionRate: 8.6,
      adsPercentage: 14.4,
      ctr: 2.12,
      cvr: 3.85,
      cpa: 62000
    },
    {
      id: 3,
      name: 'Lê Văn C',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      revenue: 425360000,
      cost: 65240000,
      conversionRate: 10.2,
      adsPercentage: 15.3,
      ctr: 2.68,
      cvr: 4.25,
      cpa: 53000
    },
    {
      id: 4,
      name: 'Phạm Thị D',
      avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
      revenue: 315780000,
      cost: 48650000,
      conversionRate: 9.2,
      adsPercentage: 15.4,
      ctr: 2.35,
      cvr: 4.05,
      cpa: 60000
    },
    {
      id: 5,
      name: 'Đào Văn E',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      revenue: 389520000,
      cost: 63450000,
      conversionRate: 9.5,
      adsPercentage: 16.3,
      ctr: 2.52,
      cvr: 4.18,
      cpa: 56000
    }
  ];

  // State cho sắp xếp
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StaffMember | null;
    direction: 'ascending' | 'descending';
  }>({
    key: null,
    direction: 'ascending'
  });

  // State cho dropdown filter đang mở
  const [openFilter, setOpenFilter] = useState<keyof StaffMember | null>(null);
  
  // Ref cho dropdown
  const filterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Hàm định dạng số tiền về VND
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Hàm định dạng phần trăm
  const formatPercent = (value: number): string => {
    return value.toFixed(2) + '%';
  };

  // Hàm sắp xếp dữ liệu
  const sortedData = React.useMemo(() => {
    let sortableItems = [...staffData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key as keyof StaffMember] < b[sortConfig.key as keyof StaffMember]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof StaffMember] > b[sortConfig.key as keyof StaffMember]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [staffData, sortConfig]);

  // Xử lý click vào tiêu đề cột để sắp xếp
  const requestSort = (key: keyof StaffMember, direction?: 'ascending' | 'descending') => {
    let newDirection: 'ascending' | 'descending' = direction || 'ascending';
    if (!direction) {
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        newDirection = 'descending';
      }
    }
    setSortConfig({ key, direction: newDirection });
    setOpenFilter(null);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openFilter && !Object.values(filterRefs.current).some(ref => 
        ref && ref.contains(event.target as Node)
      )) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilter]);

  // Lấy className cho tiêu đề cột dựa trên trạng thái sắp xếp
  const getClassNamesFor = (name: string) => {
    if (!sortConfig) {
      return '';
    }
    return sortConfig.key === name ? sortConfig.direction : '';
  };

  // Xử lý toggle dropdown filter
  const toggleFilter = (key: keyof StaffMember, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenFilter(openFilter === key ? null : key);
  };

  // Kiểm tra xem dropdown có đang mở không
  const isFilterOpen = (key: keyof StaffMember) => {
    return openFilter === key;
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Hiệu suất nhân sự</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('name')}>
                    Nhân sự
                    <span className={`ml-1 ${getClassNamesFor('name')}`}>
                      {getClassNamesFor('name') === 'ascending' ? '↑' : getClassNamesFor('name') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['name'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('name', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('name') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('name', 'ascending')}
                          >
                            Từ A đến Z
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('name', 'descending')}
                          >
                            Từ Z đến A
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('revenue')}>
                    Doanh thu
                    <span className={`ml-1 ${getClassNamesFor('revenue')}`}>
                      {getClassNamesFor('revenue') === 'ascending' ? '↑' : getClassNamesFor('revenue') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['revenue'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('revenue', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('revenue') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('revenue', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('revenue', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('cost')}>
                    Chi phí
                    <span className={`ml-1 ${getClassNamesFor('cost')}`}>
                      {getClassNamesFor('cost') === 'ascending' ? '↑' : getClassNamesFor('cost') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['cost'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('cost', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('cost') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('cost', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('cost', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('conversionRate')}>
                    Tỷ lệ chuyển đổi
                    <span className={`ml-1 ${getClassNamesFor('conversionRate')}`}>
                      {getClassNamesFor('conversionRate') === 'ascending' ? '↑' : getClassNamesFor('conversionRate') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['conversionRate'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('conversionRate', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('conversionRate') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('conversionRate', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('conversionRate', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('adsPercentage')}>
                    % ads
                    <span className={`ml-1 ${getClassNamesFor('adsPercentage')}`}>
                      {getClassNamesFor('adsPercentage') === 'ascending' ? '↑' : getClassNamesFor('adsPercentage') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['adsPercentage'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('adsPercentage', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('adsPercentage') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('adsPercentage', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('adsPercentage', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('ctr')}>
                    CTR
                    <span className={`ml-1 ${getClassNamesFor('ctr')}`}>
                      {getClassNamesFor('ctr') === 'ascending' ? '↑' : getClassNamesFor('ctr') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['ctr'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('ctr', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('ctr') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('ctr', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('ctr', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('cvr')}>
                    CVR
                    <span className={`ml-1 ${getClassNamesFor('cvr')}`}>
                      {getClassNamesFor('cvr') === 'ascending' ? '↑' : getClassNamesFor('cvr') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['cvr'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('cvr', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('cvr') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('cvr', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('cvr', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <div className="cursor-pointer" onClick={() => requestSort('cpa')}>
                    CPA
                    <span className={`ml-1 ${getClassNamesFor('cpa')}`}>
                      {getClassNamesFor('cpa') === 'ascending' ? '↑' : getClassNamesFor('cpa') === 'descending' ? '↓' : ''}
                    </span>
                  </div>
                  <div className="relative" ref={el => filterRefs.current['cpa'] = el}>
                    <button className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none" onClick={(e) => toggleFilter('cpa', e)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </button>
                    {isFilterOpen('cpa') && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <div className="py-1">
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('cpa', 'ascending')}
                          >
                            Từ thấp đến cao
                          </button>
                          <button
                            className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                            onClick={() => requestSort('cpa', 'descending')}
                          >
                            Từ cao đến thấp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full" src={staff.avatar} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(staff.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(staff.cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPercent(staff.conversionRate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPercent(staff.adsPercentage)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPercent(staff.ctr)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPercent(staff.cvr)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(staff.cpa)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffPerformanceTable;
