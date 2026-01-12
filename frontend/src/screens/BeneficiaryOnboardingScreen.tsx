import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Switch, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function BeneficiaryOnboardingScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showTerms, setShowTerms] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        // 1. Identificação
        cpf: '',
        dataNascimento: '',
        telefone: '',
        endereco: '',

        // 2. Família & Moradia
        numeroDependentes: '',
        menoresIdade: '',
        possuiDeficiencia: false,
        tipoDeficiencia: '',
        tipoMoradia: '', // Propria, Alugada, Cedida, Ocupacao
        saneamentoAgua: false,
        saneamentoLuz: false,
        saneamentoLixo: false,
        saneamentoEsgoto: false,

        // 3. Socioeconômico
        rendaFamiliar: '',
        ocupacao: '', // Empregado, Autonomo, Desempregado, Aposentado
        beneficiosSociais: '', // Bolsa Familia, BPC, Nenhum

        // 4. Espiritualidade
        acreditaDeus: true,
        religiao: '',
        frequentaIgreja: '',
        conhecerJesus: true,

        // 5. Vínculo e LGPD
        projetoInteresse: '',
        termosAceitos: false
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => {
        if (step < 5) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    async function handleSubmit() {
        if (!formData.termosAceitos) {
            Alert.alert('Atenção', 'Você deve aceitar os Termos de Uso para continuar.');
            return;
        }

        setLoading(true);
        try {
            // Mapping frontend data to backend structure
            const payload = {
                // Explicit fields handled by controller logic or need expansion in controller if explicit in schema
                // Controller currently extracts rendaFamiliar/numeroDependentes/possuiDeficiencia explicitly
                rendaFamiliar: parseFloat(formData.rendaFamiliar.replace(',', '.') || '0'),
                numeroDependentes: parseInt(formData.numeroDependentes || '0'),
                possuiDeficiencia: formData.possuiDeficiencia,

                dadosQuestionarioSocial: {
                    ...formData, // Send everything else as JSON
                    // Adjust specific types for JSON if needed
                    saneamento: {
                        agua: formData.saneamentoAgua,
                        luz: formData.saneamentoLuz,
                        lixo: formData.saneamentoLixo,
                        esgoto: formData.saneamentoEsgoto
                    }
                }
            };

            // Note: Controller might need update if we want to save CPF/Phone to explicit Usuario fields.
            // Current ProfileController.atualizarBeneficiario logic primarily handles PerfilBeneficiario.
            // If we want to update Usuario fields (cpf, phone), we need to update the Controller logic or send a separate request.
            // For now, let's assume we send everything to ProfileController and it stores in JSON + explicitly mapped Beneficiary fields.
            // *Ideally* we should update ProfileController to update Usuario fields too.
            // But let's stick to the current backend readiness.

            await api.put('/perfil/beneficiario', payload);

            Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Bem-vindo.');
            await refreshUser();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar cadastro.');
        } finally {
            setLoading(false);
        }
    }

    const renderStep1 = () => (
        <View>
            <Text style={styles.sectionTitle}>1. Identificação</Text>

            <Text style={styles.label}>CPF</Text>
            <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChangeText={(t) => updateForm('cpf', t)}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                value={formData.dataNascimento}
                onChangeText={(t) => updateForm('dataNascimento', t)}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Telefone (WhatsApp)</Text>
            <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChangeText={(t) => updateForm('telefone', t)}
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Endereço Completo</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Rua, Número, Bairro, CEP"
                multiline
                value={formData.endereco}
                onChangeText={(t) => updateForm('endereco', t)}
            />
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={styles.sectionTitle}>2. Família & Moradia</Text>

            <Text style={styles.label}>Quantas pessoas moram na casa?</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: 4"
                keyboardType="numeric"
                value={formData.numeroDependentes}
                onChangeText={(t) => updateForm('numeroDependentes', t)}
            />

            <View style={styles.row}>
                <Text style={styles.labelSwitch}>Alguém possui deficiência?</Text>
                <Switch
                    value={formData.possuiDeficiencia}
                    onValueChange={(v) => updateForm('possuiDeficiencia', v)}
                />
            </View>

            {formData.possuiDeficiencia && (
                <>
                    <Text style={styles.label}>Qual deficiência?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Descreva..."
                        value={formData.tipoDeficiencia}
                        onChangeText={(t) => updateForm('tipoDeficiencia', t)}
                    />
                </>
            )}

            <Text style={styles.label}>Tipo de Moradia</Text>
            <View style={styles.optionContainer}>
                {['Própria', 'Alugada', 'Cedida', 'Ocupação'].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, formData.tipoMoradia === opt && styles.optionSelected]}
                        onPress={() => updateForm('tipoMoradia', opt)}
                    >
                        <Text style={[styles.optionText, formData.tipoMoradia === opt && styles.optionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Acesso a Saneamento (Marque o que possui)</Text>
            <View style={styles.checkboxContainer}>
                {[
                    { key: 'saneamentoAgua', label: 'Água Encanada' },
                    { key: 'saneamentoLuz', label: 'Energia Elétrica' },
                    { key: 'saneamentoLixo', label: 'Coleta de Lixo' },
                    { key: 'saneamentoEsgoto', label: 'Esgoto Tratado' },
                ].map(item => (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.checkboxItem}
                        onPress={() => updateForm(item.key, !formData[item.key as keyof typeof formData])}
                    >
                        <View style={[styles.checkboxBox, formData[item.key as keyof typeof formData] && styles.checkboxBoxSelected]} />
                        <Text style={styles.checkboxLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text style={styles.sectionTitle}>3. Socioeconômico</Text>

            <Text style={styles.label}>Renda Familiar Total (R$)</Text>
            <TextInput
                style={styles.input}
                placeholder="0,00"
                keyboardType="numeric"
                value={formData.rendaFamiliar}
                onChangeText={(t) => updateForm('rendaFamiliar', t)}
            />

            <Text style={styles.label}>Ocupação Principal</Text>
            <View style={styles.optionContainer}>
                {['Empregado (CLT)', 'Autônomo', 'Desempregado', 'Aposentado'].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, formData.ocupacao === opt && styles.optionSelected]}
                        onPress={() => updateForm('ocupacao', opt)}
                    >
                        <Text style={[styles.optionText, formData.ocupacao === opt && styles.optionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Recebe Benefício Social?</Text>
            <View style={styles.optionContainer}>
                {['Nenhum', 'Bolsa Família', 'BPC', 'Outro'].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, formData.beneficiosSociais === opt && styles.optionSelected]}
                        onPress={() => updateForm('beneficiosSociais', opt)}
                    >
                        <Text style={[styles.optionText, formData.beneficiosSociais === opt && styles.optionTextSelected]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View>
            <Text style={styles.sectionTitle}>4. Espiritualidade</Text>

            <View style={styles.row}>
                <Text style={styles.labelSwitch}>Acredita em Deus?</Text>
                <Switch
                    value={formData.acreditaDeus}
                    onValueChange={(v) => updateForm('acreditaDeus', v)}
                />
            </View>

            <Text style={styles.label}>Pratica alguma religião? Qual?</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Católica, Evangélica, Nenhuma..."
                value={formData.religiao}
                onChangeText={(t) => updateForm('religiao', t)}
            />

            <Text style={styles.label}>Frequenta alguma igreja?</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome da igreja ou grupo"
                value={formData.frequentaIgreja}
                onChangeText={(t) => updateForm('frequentaIgreja', t)}
            />

            <View style={styles.row}>
                <Text style={styles.labelSwitch}>Gostaria de conhecer Jesus?</Text>
                <Switch
                    value={formData.conhecerJesus}
                    onValueChange={(v) => updateForm('conhecerJesus', v)}
                />
            </View>
        </View>
    );

    const renderStep5 = () => (
        <View>
            <Text style={styles.sectionTitle}>5. Finalização</Text>

            <Text style={styles.label}>Qual projeto deseja participar?</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: Tribo de Judá, Karatê..."
                value={formData.projetoInteresse}
                onChangeText={(t) => updateForm('projetoInteresse', t)}
            />

            <TouchableOpacity
                style={styles.termsButton}
                onPress={() => setShowTerms(true)}
            >
                <Text style={styles.termsButtonText}>📄 Ler Termo de Consentimento (LGPD)</Text>
            </TouchableOpacity>

            <View style={styles.checkboxContainer}>
                <TouchableOpacity
                    style={styles.checkboxItem}
                    onPress={() => updateForm('termosAceitos', !formData.termosAceitos)}
                >
                    <View style={[styles.checkboxBox, formData.termosAceitos && styles.checkboxBoxSelected]} />
                    <Text style={styles.checkboxLabel}>
                        Li e concordo com o Termo de Consentimento e Uso de Dados. O preenchimento incorreto pode invalidar o cadastro.
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
            </View>
            <Text style={styles.stepIndicator}>Passo {step} de 5</Text>

            <ScrollView style={styles.content}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
                {step === 5 && renderStep5()}
            </ScrollView>

            <View style={styles.footer}>
                {step > 1 && (
                    <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={prevStep}>
                        <Text style={styles.buttonOutlineText}>Voltar</Text>
                    </TouchableOpacity>
                )}

                {step < 5 ? (
                    <TouchableOpacity style={styles.button} onPress={nextStep}>
                        <Text style={styles.buttonText}>Próximo</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: formData.termosAceitos ? '#4CAF50' : '#ccc' }]}
                        onPress={handleSubmit}
                        disabled={!formData.termosAceitos || loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Finalizar Cadastro</Text>}
                    </TouchableOpacity>
                )}
            </View>

            <Modal visible={showTerms} animationType="slide">
                <View style={styles.modalContainer}>
                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Termo de Consentimento e Uso de Dados (LGPD)</Text>
                        <Text style={styles.modalText}>
                            Ao prosseguir com este cadastro, eu, na qualidade de titular dos dados (ou responsável legal), declaro estar ciente e concordar com o tratamento de minhas informações pela Associação Teleios.
                            {'\n\n'}
                            1. **Finalidade**: Identificação nos projetos, análise socioeconômica e comunicação.
                            {'\n\n'}
                            2. **Compartilhamento**: Não comercializamos seus dados. Compartilhamento apenas com parceiros ou obrigação legal.
                            {'\n\n'}
                            3. **Segurança**: Armazenamento seguro enquanto durar o vínculo.
                            {'\n\n'}
                            4. **Direitos**: Você pode acessar, corrigir ou solicitar exclusão a qualquer momento.
                        </Text>
                        <TouchableOpacity style={styles.button} onPress={() => setShowTerms(false)}>
                            <Text style={styles.buttonText}>Entendi e Fechar</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    progressBar: { height: 6, backgroundColor: '#eee', width: '100%' },
    progressFill: { height: '100%', backgroundColor: '#4a90e2' },
    stepIndicator: { textAlign: 'center', color: '#888', marginTop: 10, fontSize: 14 },
    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    label: { fontSize: 16, color: '#444', marginBottom: 8, marginTop: 10, fontWeight: '600' },
    labelSwitch: { fontSize: 16, color: '#444', flex: 1, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },

    optionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    optionButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', marginBottom: 5 },
    optionSelected: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
    optionText: { color: '#666' },
    optionTextSelected: { color: '#fff', fontWeight: 'bold' },

    checkboxContainer: { marginTop: 10 },
    checkboxItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkboxBox: { width: 24, height: 24, borderWidth: 2, borderColor: '#4a90e2', marginRight: 10, borderRadius: 4 },
    checkboxBoxSelected: { backgroundColor: '#4a90e2' },
    checkboxLabel: { flex: 1, fontSize: 14, color: '#555' },

    termsButton: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginVertical: 15, alignItems: 'center' },
    termsButtonText: { color: '#4a90e2', fontWeight: 'bold' },

    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
    button: { backgroundColor: '#4a90e2', padding: 15, borderRadius: 8, alignItems: 'center', flex: 1, marginLeft: 5 },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#4a90e2', marginRight: 5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    buttonOutlineText: { color: '#4a90e2', fontSize: 16, fontWeight: 'bold' },

    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalText: { fontSize: 16, color: '#555', lineHeight: 24, marginBottom: 20 }
});
