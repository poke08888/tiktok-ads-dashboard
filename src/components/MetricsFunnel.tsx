import React from 'react';

interface MetricsFunnelProps {
  title: string;
  metrics: {
    label: string;
    value: number;
    color: string;
  }[];
}

const MetricsFunnel: React.FC<MetricsFunnelProps> = ({ title, metrics }) => {
  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  // Tính toán tỷ lệ chuyển đổi giữa các tầng
  const calculateConversionRate = (index: number) => {
    if (index === 0 || metrics.length <= 1) return null;
    const rate = (metrics[index].value / metrics[index - 1].value) * 100;
    return rate.toFixed(1) + '%';
  };

  // Xem tầng nào là tầng Click và Order để hiển thị CTR và CVR
  const getRateLabel = (index: number) => {
    if (index === 1) return 'CTR:';
    if (index === 2) return 'CVR:';
    return '';
  };

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-6">{title}</h2>
      <div className="flex flex-col items-center justify-center space-y-6 flex-grow">
        {metrics.map((metric, index) => {
          // Tính toán kích thước tương đối cho mỗi tầng
          const maxWidth = 85;
          const minWidth = 42;
          const steps = metrics.length;
          const widthDecrement = (maxWidth - minWidth) / (steps - 1);
          const width = maxWidth - (index * widthDecrement);
          
          // Tạo các màu gradient cho hiệu ứng 3D
          const darkerColor = adjustColorBrightness(metric.color, -15); // Phần tối hơn
          const lighterColor = adjustColorBrightness(metric.color, 15); // Phần sáng hơn
          
          return (
            <div key={index} className="relative w-full flex justify-center" style={{ zIndex: 10 - index }}>
              {/* Container chính cho mỗi tầng phễu */}
              <div style={{ width: `${width}%` }}>
                {/* Phần phễu elliptical */}
                <div className="relative">
                  {/* Phần trên của phễu - ellipse */}
                  <div 
                    className="w-full relative" 
                    style={{ 
                      height: '24px',
                      background: `linear-gradient(to bottom, ${lighterColor}, ${metric.color})`,
                      borderTopLeftRadius: '50%',
                      borderTopRightRadius: '50%',
                      borderBottomLeftRadius: '0',
                      borderBottomRightRadius: '0',
                      transform: 'perspective(100px) rotateX(30deg)',
                      transformOrigin: 'center bottom'
                    }}
                  />
                  
                  {/* Phần thân chính */}
                  <div 
                    className="flex flex-col items-center justify-center" 
                    style={{ 
                      background: metric.color,
                      height: '70px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Tên chỉ số và giá trị */}
                    <div className="text-white font-bold text-2xl">{metric.label}</div>
                    <div className="text-white font-semibold text-xl mt-1">{formatValue(metric.value)}</div>
                    
                    {/* Overlay gradient */}
                    <div 
                      className="absolute inset-0 pointer-events-none" 
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
                      }}
                    />
                  </div>
                  
                  {/* Phần dưới - bottom ellipse */}
                  <div 
                    className="w-full relative" 
                    style={{ 
                      height: '24px',
                      background: `linear-gradient(to top, ${darkerColor}, ${metric.color})`,
                      borderTopLeftRadius: '0',
                      borderTopRightRadius: '0',
                      borderBottomLeftRadius: '50%',
                      borderBottomRightRadius: '50%',
                      transform: 'perspective(100px) rotateX(-30deg)',
                      transformOrigin: 'center top'
                    }}
                  />
                </div>
              </div>
              
              {/* Hiển thị tỷ lệ chuyển đổi bên phải */}
              {index > 0 && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-4">
                  <div className="flex items-center">
                    {/* Đường nối */}
                    <div className="border-t border-dashed border-gray-300 w-12 mr-2" />
                    
                    {/* Text */}
                    <div className="bg-white px-3 py-1 rounded-full shadow-md">
                      <div className="flex items-center">
                        <span className="text-sm font-bold text-gray-700 mr-1">{getRateLabel(index)}</span>
                        <span className="text-base font-bold text-blue-600">{calculateConversionRate(index)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hàm điều chỉnh độ sáng của màu
function adjustColorBrightness(color: string, percent: number) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.min(255, Math.max(0, R + percent));
  G = Math.min(255, Math.max(0, G + percent));
  B = Math.min(255, Math.max(0, B + percent));

  const RR = R.toString(16).padStart(2, '0');
  const GG = G.toString(16).padStart(2, '0');
  const BB = B.toString(16).padStart(2, '0');

  return `#${RR}${GG}${BB}`;
}

export default MetricsFunnel;
