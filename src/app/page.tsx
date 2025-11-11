"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Bot,
  Crown,
  Zap,
  Star,
  MessageCircle,
  Send,
  Lock,
  Check,
  X,
  BarChart3,
  Wallet,
  Target,
  Eye,
  EyeOff,
  Sparkles,
  Brain,
  Rocket
} from 'lucide-react'

interface CryptoData {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  image: string
}

interface PortfolioItem {
  id: string
  symbol: string
  name: string
  amount: number
  buyPrice: number
  currentPrice: number
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

type PlanType = 'free' | 'pro' | 'premium'

interface Plan {
  id: PlanType
  name: string
  price: number
  features: string[]
  aiQueries: number
  color: string
  icon: React.ReactNode
}

export default function CryptoGeniusAI() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trading')
  const [hideBalances, setHideBalances] = useState(false)
  
  // IA Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [currentPlan, setCurrentPlan] = useState<PlanType>('free')
  const [aiQueriesUsed, setAiQueriesUsed] = useState(0)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['5 consultas IA/dia', 'Análises básicas', 'Alertas limitados'],
      aiQueries: 5,
      color: 'bg-gray-500',
      icon: <Star className="w-5 h-5" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: ['100 consultas IA/dia', 'Análises avançadas', 'Alertas ilimitados', 'Sinais de trading'],
      aiQueries: 100,
      color: 'bg-blue-500',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99,
      features: ['Consultas IA ilimitadas', 'IA personalizada', 'Análises em tempo real', 'Suporte prioritário', 'Estratégias exclusivas'],
      aiQueries: -1, // unlimited
      color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      icon: <Crown className="w-5 h-5" />
    }
  ]

  const getCurrentPlan = () => plans.find(p => p.id === currentPlan)!

  // Mock AI responses
  const aiResponses = [
    "📈 Baseado na análise técnica, BTC está mostrando sinais de alta. RSI em 45 indica possível entrada.",
    "⚠️ ETH está em resistência forte em $2,400. Aguarde rompimento para posição longa.",
    "🎯 Recomendo diversificar: 40% BTC, 30% ETH, 20% altcoins, 10% stablecoins para este mercado.",
    "📊 Volume de BTC aumentou 23% nas últimas 4h. Possível movimento forte se aproximando.",
    "💡 Estratégia DCA recomendada: compre $100 semanais em BTC durante próximos 3 meses.",
    "🔥 ADA mostra padrão de reversão. Stop loss em $0.45, alvo em $0.65.",
    "⚡ Mercado altista confirmado! Momentum forte em layer 1s. AVAX e SOL com potencial.",
    "🎪 Cuidado: mercado sobrecomprado. Considere realizar lucros parciais em posições longas."
  ]

  useEffect(() => {
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      )
      const data = await response.json()
      setCryptos(data)
      
      setPortfolio(prev => prev.map(item => {
        const crypto = data.find((c: CryptoData) => c.symbol.toLowerCase() === item.symbol.toLowerCase())
        return crypto ? { ...item, currentPrice: crypto.current_price } : item
      }))
      
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      toast.error('Erro ao carregar dados das criptomoedas')
      setLoading(false)
    }
  }

  const canUseAI = () => {
    const plan = getCurrentPlan()
    return plan.aiQueries === -1 || aiQueriesUsed < plan.aiQueries
  }

  const sendMessage = async () => {
    if (!chatInput.trim()) return
    
    if (!canUseAI()) {
      toast.error('Limite de consultas atingido! Faça upgrade do seu plano.')
      setShowPlanModal(true)
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsAiTyping(true)
    
    // Increment AI queries used
    setAiQueriesUsed(prev => prev + 1)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
      setIsAiTyping(false)
    }, 2000)
  }

  const upgradePlan = (planId: PlanType) => {
    setCurrentPlan(planId)
    setAiQueriesUsed(0) // Reset queries on upgrade
    setShowPlanModal(false)
    toast.success(`Plano ${plans.find(p => p.id === planId)?.name} ativado com sucesso!`)
  }

  const getTotalPortfolioValue = () => {
    return portfolio.reduce((total, item) => total + (item.amount * item.currentPrice), 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#F0B90B] mx-auto mb-4"></div>
          <p className="text-white text-xl">Carregando CryptoGenius AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      {/* Header */}
      <header className="bg-[#1E2026] border-b border-[#2B2F36]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#F0B90B] rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-black" />
                </div>
                <h1 className="text-2xl font-bold text-white">CryptoGenius AI</h1>
              </div>
              
              {/* Plan Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getCurrentPlan().color}`}>
                {getCurrentPlan().icon}
                <span className="ml-1">{getCurrentPlan().name.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHideBalances(!hideBalances)}
                className="text-white border-[#2B2F36] hover:bg-[#2B2F36]"
              >
                {hideBalances ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              
              <div className="text-right">
                <p className="text-sm text-gray-400">Portfolio Total</p>
                <p className="text-xl font-bold text-[#F0B90B]">
                  {hideBalances ? '••••••' : formatCurrency(getTotalPortfolioValue())}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#1E2026] border-[#2B2F36]">
            <TabsTrigger value="trading" className="text-gray-300 data-[state=active]:bg-[#2B2F36] data-[state=active]:text-white">
              Trading
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-gray-300 data-[state=active]:bg-[#2B2F36] data-[state=active]:text-white">
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="text-gray-300 data-[state=active]:bg-[#2B2F36] data-[state=active]:text-white">
              IA Assistant
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-gray-300 data-[state=active]:bg-[#2B2F36] data-[state=active]:text-white">
              Planos
            </TabsTrigger>
          </TabsList>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1E2026] border-[#2B2F36]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">24h Volume</p>
                      <p className="text-lg font-bold text-white">$89.2B</p>
                    </div>
                    <BarChart3 className="w-6 h-6 text-[#F0B90B]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1E2026] border-[#2B2F36]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Market Cap</p>
                      <p className="text-lg font-bold text-white">$2.1T</p>
                    </div>
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1E2026] border-[#2B2F36]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">BTC Dominance</p>
                      <p className="text-lg font-bold text-white">54.2%</p>
                    </div>
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1E2026] border-[#2B2F36]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Fear & Greed</p>
                      <p className="text-lg font-bold text-green-400">72 (Greed)</p>
                    </div>
                    <Brain className="w-6 h-6 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crypto List */}
            <Card className="bg-[#1E2026] border-[#2B2F36]">
              <CardHeader>
                <CardTitle className="text-white">Mercado de Criptomoedas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cryptos.slice(0, 15).map(crypto => (
                    <div key={crypto.id} className="flex items-center justify-between p-3 hover:bg-[#2B2F36] rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                        <div>
                          <p className="text-white font-medium">{crypto.symbol.toUpperCase()}</p>
                          <p className="text-sm text-gray-400">{crypto.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-medium">{formatCurrency(crypto.current_price)}</p>
                        <div className="flex items-center gap-1">
                          {crypto.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className={crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatPercent(crypto.price_change_percentage_24h)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <Card className="bg-[#1E2026] border-[#2B2F36]">
              <CardHeader>
                <CardTitle className="text-white">Meu Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Portfolio Vazio</h3>
                    <p className="text-gray-400 mb-6">Comece a investir para acompanhar seus lucros</p>
                    <Button className="bg-[#F0B90B] hover:bg-[#F0B90B]/80 text-black font-bold">
                      Começar a Investir
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolio.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-[#2B2F36] rounded-lg">
                        <div>
                          <p className="text-white font-bold">{item.symbol.toUpperCase()}</p>
                          <p className="text-gray-400">{item.amount} coins</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {hideBalances ? '••••••' : formatCurrency(item.amount * item.currentPrice)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {formatCurrency(item.currentPrice)} cada
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            {/* AI Usage Stats */}
            <Card className="bg-[#1E2026] border-[#2B2F36]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#F0B90B]/20 rounded-full">
                      <Bot className="w-5 h-5 text-[#F0B90B]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">IA Assistant</p>
                      <p className="text-sm text-gray-400">
                        {getCurrentPlan().aiQueries === -1 
                          ? 'Consultas ilimitadas' 
                          : `${aiQueriesUsed}/${getCurrentPlan().aiQueries} consultas hoje`
                        }
                      </p>
                    </div>
                  </div>
                  
                  {!canUseAI() && (
                    <Button 
                      onClick={() => setShowPlanModal(true)}
                      className="bg-[#F0B90B] hover:bg-[#F0B90B]/80 text-black font-bold"
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="bg-[#1E2026] border-[#2B2F36]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#F0B90B]" />
                  Chat com IA Especialista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto space-y-3 p-4 bg-[#0B0B0F] rounded-lg">
                    {chatMessages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">Olá! Sou sua IA especialista em crypto. Como posso ajudar?</p>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChatInput('Analise o Bitcoin para mim')}
                            className="text-gray-300 border-[#2B2F36] hover:bg-[#2B2F36]"
                          >
                            Analisar BTC
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChatInput('Qual a melhor estratégia agora?')}
                            className="text-gray-300 border-[#2B2F36] hover:bg-[#2B2F36]"
                          >
                            Estratégia
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setChatInput('Diversificar portfolio')}
                            className="text-gray-300 border-[#2B2F36] hover:bg-[#2B2F36]"
                          >
                            Diversificar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {chatMessages.map(message => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user' 
                            ? 'bg-[#F0B90B] text-black' 
                            : 'bg-[#2B2F36] text-white'
                        }`}>
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#2B2F36] text-white px-4 py-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={canUseAI() ? "Digite sua pergunta sobre crypto..." : "Upgrade seu plano para usar a IA"}
                      disabled={!canUseAI()}
                      className="bg-[#2B2F36] border-[#2B2F36] text-white placeholder-gray-400"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!canUseAI() || !chatInput.trim()}
                      className="bg-[#F0B90B] hover:bg-[#F0B90B]/80 text-black"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {!canUseAI() && (
                    <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 font-medium">Limite de consultas atingido</p>
                      <p className="text-gray-400 text-sm">Faça upgrade do seu plano para continuar usando a IA</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Escolha Seu Plano</h2>
              <p className="text-gray-400">Desbloqueie o poder da IA para maximizar seus lucros</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(plan => (
                <Card key={plan.id} className={`bg-[#1E2026] border-[#2B2F36] relative ${
                  currentPlan === plan.id ? 'ring-2 ring-[#F0B90B]' : ''
                }`}>
                  {plan.id === 'premium' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                        MAIS POPULAR
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${plan.color} mb-4`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-white">
                      ${plan.price}
                      <span className="text-lg text-gray-400">/mês</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <Check className="w-4 h-4 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => upgradePlan(plan.id)}
                      disabled={currentPlan === plan.id}
                      className={`w-full ${
                        currentPlan === plan.id 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-[#F0B90B] hover:bg-[#F0B90B]/80 text-black font-bold'
                      }`}
                    >
                      {currentPlan === plan.id ? 'Plano Atual' : 'Escolher Plano'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Comparison */}
            <Card className="bg-[#1E2026] border-[#2B2F36]">
              <CardHeader>
                <CardTitle className="text-white">Comparação de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#2B2F36]">
                        <th className="text-left py-3 text-gray-400">Recurso</th>
                        <th className="text-center py-3 text-gray-400">Free</th>
                        <th className="text-center py-3 text-gray-400">Pro</th>
                        <th className="text-center py-3 text-gray-400">Premium</th>
                      </tr>
                    </thead>
                    <tbody className="text-white">
                      <tr className="border-b border-[#2B2F36]">
                        <td className="py-3">Consultas IA por dia</td>
                        <td className="text-center py-3">5</td>
                        <td className="text-center py-3">100</td>
                        <td className="text-center py-3">Ilimitado</td>
                      </tr>
                      <tr className="border-b border-[#2B2F36]">
                        <td className="py-3">Análises técnicas</td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2B2F36]">
                        <td className="py-3">Sinais de trading</td>
                        <td className="text-center py-3"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-[#2B2F36]">
                        <td className="py-3">IA personalizada</td>
                        <td className="text-center py-3"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                        <td className="text-center py-3"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="py-3">Suporte prioritário</td>
                        <td className="text-center py-3"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                        <td className="text-center py-3"><X className="w-4 h-4 text-red-400 mx-auto" /></td>
                        <td className="text-center py-3"><Check className="w-4 h-4 text-green-400 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Plan Upgrade Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="bg-[#1E2026] border-[#2B2F36] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              <Rocket className="w-8 h-8 text-[#F0B90B] mx-auto mb-2" />
              Upgrade Necessário
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Você atingiu o limite de consultas do plano {getCurrentPlan().name}.
            </p>
            <p className="text-white font-bold">
              Faça upgrade para continuar usando a IA!
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => upgradePlan('pro')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Pro - $29/mês
              </Button>
              <Button 
                onClick={() => upgradePlan('premium')}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:opacity-90 text-black font-bold"
              >
                Premium - $99/mês
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}