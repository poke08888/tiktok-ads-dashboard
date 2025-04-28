import React, { useState } from 'react';

interface Product {
  id: string;
  rank: number;
  image: string;
  name: string;
  code: string;
  sales: number;
  orders: number;
  views: number;
}

const TopProductList: React.FC = () => {
  const [filterType, setFilterType] = useState('all');

  const productData: Product[] = [
    { 
      id: '1', 
      rank: 1, 
      image: 'https://placekitten.com/100/100', 
      name: 'MED034', 
      code: 'Phấn phủ M',
      sales: 2700000, 
      orders: 15, 
      views: 5200 
    },
    { 
      id: '2', 
      rank: 2, 
      image: 'https://placekitten.com/101/101', 
      name: 'MED031', 
      code: 'Phấn phủ M',
      sales: 982000, 
      orders: 8, 
      views: 3100 
    },
    { 
      id: '3', 
      rank: 3, 
      image: 'https://placekitten.com/102/102', 
      name: 'MED929', 
      code: 'Phấn phủ R',
      sales: 785000, 
      orders: 5, 
      views: 2800 
    },
    { 
      id: '4', 
      rank: 4, 
      image: 'https://placekitten.com/103/103', 
      name: 'MED315', 
      code: 'Phấn phủ M',
      sales: 680000, 
      orders: 5, 
      views: 2500 
    },
    { 
      id: '5', 
      rank: 5, 
      image: 'https://placekitten.com/104/104', 
      name: 'MED011', 
      code: 'Phấn phủ M',
      sales: 570000, 
      orders: 4, 
      views: 2100 
    },
    { 
      id: '6', 
      rank: 6, 
      image: 'https://placekitten.com/105/105', 
      name: 'MED022', 
      code: 'Phấn phủ N',
      sales: 485000, 
      orders: 3, 
      views: 1950 
    },
    { 
      id: '7', 
      rank: 7, 
      image: 'https://placekitten.com/106/106', 
      name: 'FNED71', 
      code: 'Phấn phủ A',
      sales: 410000, 
      orders: 3, 
      views: 1650 
    },
    { 
      id: '8', 
      rank: 8, 
      image: 'https://placekitten.com/107/107', 
      name: 'MED033', 
      code: 'Phấn phủ C',
      sales: 360000, 
      orders: 2, 
      views: 1450 
    },
    { 
      id: '9', 
      rank: 9, 
      image: 'https://placekitten.com/108/108', 
      name: 'MED121', 
      code: 'Phấn phủ M',
      sales: 320000, 
      orders: 2, 
      views: 1300 
    },
    { 
      id: '10', 
      rank: 10, 
      image: 'https://placekitten.com/109/109', 
      name: 'MED592', 
      code: 'Phấn phủ D',
      sales: 290000, 
      orders: 2, 
      views: 1100 
    },
  ];

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">SKU hàng hoá bán chạy Top100</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-xs rounded-md ${filterType === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setFilterType('all')}
          >
            Xếp theo doanh thu
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md ${filterType === 'order' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setFilterType('order')}
          >
            Xếp theo đơn hàng
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md ${filterType === 'view' ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setFilterType('view')}
          >
            Xếp theo lượt xem
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Xếp hạng
                </th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Sản phẩm
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Số lượng
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Doanh thu
                </th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Tỷ lệ chuyển đổi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productData.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${
                      product.rank <= 3 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.rank}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="text-sm text-gray-900">{product.orders}</div>
                    <div className="text-xs text-gray-500">{formatNumber(product.views)} lượt xem</div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {formatCurrency(product.sales)} ₫
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-right text-sm">
                    {(product.orders / product.views * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Trước
            </a>
            <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Tiếp
            </a>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">10</span> của <span className="font-medium">97</span> sản phẩm
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-50 text-sm font-medium text-indigo-600 hover:bg-indigo-100">
                  2
                </a>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  3
                </a>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
                <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  10
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span className="sr-only">Tiếp</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopProductList;
